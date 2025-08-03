import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PmMachine } from "@shared/schema";

interface PMDataTableProps {
  machines: PmMachine[];
  isLoading: boolean;
  selectedMachines: string[];
  onSelectionChange: (selected: string[]) => void;
  onNoteClick: (idMsn: string) => void;
}

export default function PMDataTable({
  machines,
  isLoading,
  selectedMachines,
  onSelectionChange,
  onNoteClick,
}: PMDataTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(machines.map(m => m.idMsn));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectMachine = (idMsn: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedMachines, idMsn]);
    } else {
      onSelectionChange(selectedMachines.filter(id => id !== idMsn));
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>No</TableHead>
              <TableHead>Id Msn</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Pengelola</TableHead>
              <TableHead>Periode PM</TableHead>
              <TableHead>Tgl Selesai PM</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Teknisi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const allSelected = machines.length > 0 && selectedMachines.length === machines.length;
  const someSelected = selectedMachines.length > 0 && selectedMachines.length < machines.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
              />
            </TableHead>
            <TableHead>No</TableHead>
            <TableHead>Id Msn</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead>Pengelola</TableHead>
            <TableHead>Periode PM</TableHead>
            <TableHead>Tgl Selesai PM</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Teknisi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {machines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Tidak ada data PM mesin
              </TableCell>
            </TableRow>
          ) : (
            machines.map((machine) => (
              <TableRow key={machine.idMsn} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedMachines.includes(machine.idMsn)}
                    onCheckedChange={(checked) => 
                      handleSelectMachine(machine.idMsn, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-900">{machine.no}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="text-sm font-medium text-primary hover:text-blue-700 p-0 h-auto"
                    onClick={() => onNoteClick(machine.idMsn)}
                  >
                    {machine.idMsn}
                  </Button>
                </TableCell>
                <TableCell className="text-sm text-gray-900">{machine.alamat}</TableCell>
                <TableCell className="text-sm text-gray-900">{machine.pengelola}</TableCell>
                <TableCell className="text-sm text-gray-900">{machine.periodePM || '-'}</TableCell>
                <TableCell className="text-sm text-gray-900">{machine.tglSelesaiPM || '-'}</TableCell>
                <TableCell>
                  <span 
                    className={`text-sm font-semibold ${
                      machine.status === 'Done' ? 'status-done' : 'status-outstanding'
                    }`}
                  >
                    {machine.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-900">{machine.teknisi}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
