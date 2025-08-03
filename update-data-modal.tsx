import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface UpdateDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDataModal({ open, onOpenChange }: UpdateDataModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdMsn, setSelectedIdMsn] = useState("");
  const [periodePM, setPeriodePM] = useState("");
  const [machineData, setMachineData] = useState({
    alamat: "",
    pengelola: "",
    teknisi: "",
  });

  const { data: machines = [] } = useQuery({
    queryKey: ["/api/pm-machines"],
    enabled: open,
  });

  const { data: selectedMachine } = useQuery({
    queryKey: ["/api/pm-machines", selectedIdMsn],
    enabled: !!selectedIdMsn && open,
  });

  useEffect(() => {
    if (selectedMachine) {
      setMachineData({
        alamat: selectedMachine.alamat,
        pengelola: selectedMachine.pengelola,
        teknisi: selectedMachine.teknisi,
      });
    }
  }, [selectedMachine]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/pm-machines/${selectedIdMsn}`, {
        periodePM,
        status: "Outstanding",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "Data Berhasil Diperbarui",
        description: "Periode PM berhasil diperbarui, status berubah menjadi Outstanding",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui data",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedIdMsn("");
    setPeriodePM("");
    setMachineData({ alamat: "", pengelola: "", teknisi: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIdMsn) {
      toast({
        title: "ID Mesin Diperlukan",
        description: "Pilih ID Mesin terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!periodePM) {
      toast({
        title: "Periode PM Diperlukan",
        description: "Masukkan periode PM",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate();
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Update Data PM
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="updateIdMsn">Id Msn</Label>
            <Select value={selectedIdMsn} onValueChange={setSelectedIdMsn}>
              <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Pilih ID Mesin" />
              </SelectTrigger>
              <SelectContent>
                {machines.map((machine) => (
                  <SelectItem key={machine.idMsn} value={machine.idMsn}>
                    {machine.idMsn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateAlamat">Alamat</Label>
            <Input
              id="updateAlamat"
              value={machineData.alamat}
              readOnly
              className="bg-gray-100"
              placeholder="Alamat (terkunci)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updatePengelola">Pengelola</Label>
            <Input
              id="updatePengelola"
              value={machineData.pengelola}
              readOnly
              className="bg-gray-100"
              placeholder="Pengelola (terkunci)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateTeknisi">Teknisi</Label>
            <Input
              id="updateTeknisi"
              value={machineData.teknisi}
              readOnly
              className="bg-gray-100"
              placeholder="Teknisi (terkunci)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updatePeriodePM">Periode PM</Label>
            <Input
              id="updatePeriodePM"
              value={periodePM}
              onChange={(e) => setPeriodePM(e.target.value)}
              placeholder="Masukkan periode PM"
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
