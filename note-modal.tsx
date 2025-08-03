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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idMsn: string;
}

export default function NoteModal({ open, onOpenChange, idMsn }: NoteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");

  const { data: note } = useQuery({
    queryKey: ["/api/machine-notes", idMsn],
    enabled: !!idMsn && open,
  });

  useEffect(() => {
    if (note) {
      setNoteContent(note.content || "");
    } else {
      setNoteContent("");
    }
  }, [note]);

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/machine-notes", {
        idMsn,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machine-notes", idMsn] });
      toast({
        title: "Note Berhasil Disimpan",
        description: "Catatan untuk mesin berhasil disimpan",
      });
      onOpenChange(false);
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
        title: "Gagal Menyimpan Note",
        description: "Terjadi kesalahan saat menyimpan catatan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(noteContent);
  };

  const handleCancel = () => {
    if (note) {
      setNoteContent(note.content || "");
    } else {
      setNoteContent("");
    }
    onOpenChange(false);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Note untuk {idMsn}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tanggal dibuat: {note?.createdAt ? formatDate(note.createdAt) : formatDate(new Date())}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteContent">Catatan</Label>
            <Textarea
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Masukkan catatan untuk mesin ini..."
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Menyimpan..." : "Simpan Note"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCancel}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
