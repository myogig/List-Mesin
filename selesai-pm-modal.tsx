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

interface SelesaiPMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SelesaiPMModal({ open, onOpenChange }: SelesaiPMModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdMsn, setSelectedIdMsn] = useState("");
  const [tglSelesaiPM, setTglSelesaiPM] = useState("");
  const [machineData, setMachineData] = useState({
    periodePM: "",
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
        periodePM: selectedMachine.periodePM || "",
        teknisi: selectedMachine.teknisi,
      });
    }
  }, [selectedMachine]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/pm-machines/${selectedIdMsn}`, {
        tglSelesaiPM,
        status: "Done",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "PM Selesai",
        description: "PM berhasil diselesaikan, status berubah menjadi Done",
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
        title: "Gagal Menyelesaikan PM",
        description: "Terjadi kesalahan saat menyelesaikan PM",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedIdMsn("");
    setTglSelesaiPM("");
    setMachineData({ periodePM: "", teknisi: "" });
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

    if (!tglSelesaiPM) {
      toast({
        title: "Tanggal Selesai Diperlukan",
        description: "Masukkan tanggal selesai PM",
        variant: "destructive",
      });
      return;
    }

    completeMutation.mutate();
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
            Selesai PM
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
            <Label htmlFor="selesaiIdMsn">Id Msn</Label>
            <Select value={selectedIdMsn} onValueChange={setSelectedIdMsn}>
              <SelectTrigger className="focus:ring-yellow-700 focus:border-yellow-700">
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
            <Label htmlFor="selesaiPeriodePM">Periode PM</Label>
            <Input
              id="selesaiPeriodePM"
              value={machineData.periodePM}
              readOnly
              className="bg-gray-100"
              placeholder="Periode PM (terkunci)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selesaiTeknisi">Teknisi</Label>
            <Input
              id="selesaiTeknisi"
              value={machineData.teknisi}
              readOnly
              className="bg-gray-100"
              placeholder="Teknisi (terkunci)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selesaiTglSelesaiPM">Tanggal Selesai PM</Label>
            <Input
              id="selesaiTglSelesaiPM"
              type="date"
              value={tglSelesaiPM}
              onChange={(e) => setTglSelesaiPM(e.target.value)}
              className="focus:ring-yellow-700 focus:border-yellow-700"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 btn-brown"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? "Menyimpan..." : "Save"}
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
