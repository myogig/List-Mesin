import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function ConfirmationModal({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleCancel}
            >
              No
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
