import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, Plus, Edit, RotateCcw, CheckCircle, Trash2, Download, Upload, Search, LogOut } from "lucide-react";
import PMDataTable from "@/components/pm-data-table";
import NewDataModal from "@/components/modals/new-data-modal";
import EditDataModal from "@/components/modals/edit-data-modal";
import UpdateDataModal from "@/components/modals/update-data-modal";
import SelesaiPMModal from "@/components/modals/selesai-pm-modal";
import NoteModal from "@/components/modals/note-modal";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import ImportModal from "@/components/modals/import-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PmMachine } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [modals, setModals] = useState({
    newData: false,
    editData: false,
    updateData: false,
    selesaiPM: false,
    note: false,
    confirmation: false,
    import: false,
  });
  const [confirmationAction, setConfirmationAction] = useState<{
    type: 'delete' | 'deleteAll';
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [selectedMachineForNote, setSelectedMachineForNote] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ["/api/pm-machines", searchQuery],
    enabled: !!user,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pm-machines/export/excel${searchQuery ? `?search=${searchQuery}` : ''}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pm-data.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Berhasil",
        description: "Data PM berhasil diekspor ke Excel",
      });
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
        title: "Export Gagal",
        description: "Gagal mengekspor data PM",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ idMsn, deleteAll }: { idMsn: string; deleteAll: boolean }) => {
      await apiRequest("DELETE", `/api/pm-machines/${idMsn}?deleteAll=${deleteAll}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
      toast({
        title: "Hapus Berhasil",
        description: "Data berhasil dihapus",
      });
      setSelectedMachines([]);
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
        title: "Hapus Gagal",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    },
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/pm-machines"] });
  };

  const handleDelete = () => {
    if (selectedMachines.length === 0) {
      toast({
        title: "Peringatan",
        description: "Pilih data yang akan dihapus terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setConfirmationAction({
      type: 'delete',
      message: 'Apakah Anda yakin ingin menghapus data Periode PM dan Tgl selesai PM yang dipilih?',
      onConfirm: () => {
        selectedMachines.forEach(idMsn => {
          deleteMutation.mutate({ idMsn, deleteAll: false });
        });
        closeModal('confirmation');
      }
    });
    openModal('confirmation');
  };

  const handleDeleteAll = () => {
    if (selectedMachines.length === 0) {
      toast({
        title: "Peringatan",
        description: "Pilih data yang akan dihapus terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setConfirmationAction({
      type: 'deleteAll',
      message: 'Apakah Anda yakin ingin menghapus SEMUA data yang dipilih?',
      onConfirm: () => {
        selectedMachines.forEach(idMsn => {
          deleteMutation.mutate({ idMsn, deleteAll: true });
        });
        closeModal('confirmation');
      }
    });
    openModal('confirmation');
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleNoteClick = (idMsn: string) => {
    setSelectedMachineForNote(idMsn);
    openModal('note');
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Cog className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Cog className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sistem Manajemen PM Mesin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || user?.email || "Administrator"}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Action Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aksi Data PM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-success" onClick={() => openModal('newData')}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button variant="destructive" onClick={() => openModal('editData')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => openModal('updateData')}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Update Data
              </Button>
              <Button className="btn-brown" onClick={() => openModal('selesaiPM')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Selesai PM
              </Button>
              <Button variant="secondary" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button variant="secondary" onClick={handleDeleteAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                All Delete
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => openModal('import')}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Pencarian</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan Pengelola/Periode PM/Status..."
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tabel Data PM Mesin</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PMDataTable
              machines={machines}
              isLoading={machinesLoading}
              selectedMachines={selectedMachines}
              onSelectionChange={setSelectedMachines}
              onNoteClick={handleNoteClick}
            />
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <NewDataModal
        open={modals.newData}
        onOpenChange={() => closeModal('newData')}
      />
      <EditDataModal
        open={modals.editData}
        onOpenChange={() => closeModal('editData')}
      />
      <UpdateDataModal
        open={modals.updateData}
        onOpenChange={() => closeModal('updateData')}
      />
      <SelesaiPMModal
        open={modals.selesaiPM}
        onOpenChange={() => closeModal('selesaiPM')}
      />
      <NoteModal
        open={modals.note}
        onOpenChange={() => closeModal('note')}
        idMsn={selectedMachineForNote}
      />
      <ConfirmationModal
        open={modals.confirmation}
        onOpenChange={() => closeModal('confirmation')}
        title="Konfirmasi Hapus"
        message={confirmationAction?.message || ""}
        onConfirm={confirmationAction?.onConfirm || (() => {})}
      />
      <ImportModal
        open={modals.import}
        onOpenChange={() => closeModal('import')}
      />
    </div>
  );
}
