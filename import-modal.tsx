import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
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

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/pm-machines/import/excel', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "Import Berhasil",
        description: `${data.imported} data berhasil diimpor${data.errors.length > 0 ? ` dengan ${data.errors.length} error` : ''}`,
      });
      onOpenChange(false);
      setSelectedFile(null);
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
        title: "Import Gagal",
        description: "Terjadi kesalahan saat mengimpor data",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "File Diperlukan",
        description: "Pilih file Excel terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(selectedFile);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format File Tidak Valid",
          description: "Hanya file Excel (.xlsx, .xls) yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Import Data Excel
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
            <Label htmlFor="importFile">Pilih File Excel</Label>
            <Input
              id="importFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500">Format yang didukung: .xlsx, .xls</p>
            {selectedFile && (
              <p className="text-sm text-green-600">File terpilih: {selectedFile.name}</p>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? "Mengimpor..." : "Import"}
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
