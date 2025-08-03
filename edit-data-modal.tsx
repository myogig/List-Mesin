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
import { X } from "lucide-react";

interface EditDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDataModal({ open, onOpenChange }: EditDataModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [idMsn, setIdMsn] = useState("");
  const [formData, setFormData] = useState({
    alamat: "",
    pengelola: "",
    teknisi: "",
  });

  const { data: machine } = useQuery({
    queryKey: ["/api/pm-machines", idMsn],
    enabled: !!idMsn && open,
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        alamat: machine.alamat,
        pengelola: machine.pengelola,
        teknisi: machine.teknisi,
      });
    }
  }, [machine]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("PUT", `/api/pm-machines/${idMsn}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "Data Berhasil Diperbarui",
        description: "Data PM berhasil diperbarui",
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
    setIdMsn("");
    setFormData({ alamat: "", pengelola: "", teknisi: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idMsn) {
      toast({
        title: "ID Mesin Diperlukan",
        description: "Masukkan ID Mesin terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!formData.alamat || !formData.pengelola || !formData.teknisi) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(formData);
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
            Edit Data PM
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
            <Label htmlFor="editIdMsn">Id Msn</Label>
            <Input
              id="editIdMsn"
              value={idMsn}
              onChange={(e) => setIdMsn(e.target.value)}
              placeholder="Masukkan ID Mesin untuk edit"
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editAlamat">Alamat</Label>
            <Input
              id="editAlamat"
              value={formData.alamat}
              onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              placeholder="Alamat"
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editPengelola">Pengelola</Label>
            <Input
              id="editPengelola"
              value={formData.pengelola}
              onChange={(e) => setFormData(prev => ({ ...prev, pengelola: e.target.value }))}
              placeholder="Pengelola"
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editTeknisi">Teknisi</Label>
            <Input
              id="editTeknisi"
              value={formData.teknisi}
              onChange={(e) => setFormData(prev => ({ ...prev, teknisi: e.target.value }))}
              placeholder="Teknisi"
              className="focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              variant="destructive"
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
              No
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
