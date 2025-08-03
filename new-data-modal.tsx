import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface NewDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewDataModal({ open, onOpenChange }: NewDataModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    idMsn: "",
    alamat: "",
    pengelola: "",
    teknisi: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/pm-machines", {
        ...data,
        status: "Outstanding",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "Data Berhasil Disimpan",
        description: "Data PM baru berhasil ditambahkan",
      });
      onOpenChange(false);
      setFormData({ idMsn: "", alamat: "", pengelola: "", teknisi: "" });
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
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idMsn || !formData.alamat || !formData.pengelola || !formData.teknisi) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({ idMsn: "", alamat: "", pengelola: "", teknisi: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Tambah Data PM Baru
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
            <Label htmlFor="idMsn">Id Msn</Label>
            <Input
              id="idMsn"
              value={formData.idMsn}
              onChange={(e) => setFormData(prev => ({ ...prev, idMsn: e.target.value }))}
              placeholder="Masukkan ID Mesin"
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              value={formData.alamat}
              onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              placeholder="Masukkan alamat"
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pengelola">Pengelola</Label>
            <Input
              id="pengelola"
              value={formData.pengelola}
              onChange={(e) => setFormData(prev => ({ ...prev, pengelola: e.target.value }))}
              placeholder="Masukkan pengelola"
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teknisi">Teknisi</Label>
            <Input
              id="teknisi"
              value={formData.teknisi}
              onChange={(e) => setFormData(prev => ({ ...prev, teknisi: e.target.value }))}
              placeholder="Masukkan nama teknisi"
              className="focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 btn-success"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Menyimpan..." : "Save"}
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
