import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SquareChartGantt, Pencil, Trash2, Menu, Printer, Barcode, XCircle, PowerOff } from "lucide-react"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"
import { notify } from "@/lib/notify"

type ActionMenuProps<T> = {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onBarcode?: (item: T) => void;
  onAuditLog?: (item: T) => void;
  onCollect?: (item: T) => void;
  onAck?: (item: T) => void;
  onValidate?: (item: T) => void;
  onReject?: (item: T) => void;
  onRevisitCancellation?: (item: T) => void;
  onDeactivate?: (item: T) => void;
};

export function ActionMenu<T>({
  item,
  onView,
  onEdit,
  onPrint,
  onBarcode,
  onDelete,
  onAuditLog,
  onCollect,
  onAck,
  onValidate,
  onReject,
  onRevisitCancellation,
  onDeactivate,
}: ActionMenuProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    if (onDelete) {
      onDelete(item);
      notify.deleteSuccess("Record deleted successfully.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger >
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onView && (
            <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
              <SquareChartGantt className="mr-2 h-4 w-4 text-blue-600" />
              View
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4 text-slate-600" />
              Edit
            </DropdownMenuItem>
          )}
          {onPrint && (
            <DropdownMenuItem onClick={() => onPrint(item)} className="cursor-pointer">
              <Printer className="mr-2 h-4 w-4 text-blue-600" />
              Print
            </DropdownMenuItem>
          )}
          {onBarcode && (
            <DropdownMenuItem onClick={() => onBarcode(item)} className="cursor-pointer">
              <Barcode className="mr-2 h-4 w-4 text-purple-600" />
              Generate Barcode
            </DropdownMenuItem>
          )}
          {onRevisitCancellation && (
            <DropdownMenuItem onClick={() => onRevisitCancellation(item)} className="text-amber-700 focus:text-amber-800 cursor-pointer">
              <XCircle className="mr-2 h-4 w-4 text-amber-600" />
             Cancellation
            </DropdownMenuItem>
          )}
          {onDeactivate && (
            <DropdownMenuItem onClick={() => onDeactivate(item)} className="text-amber-700 focus:text-amber-800 cursor-pointer">
              <PowerOff className="mr-2 h-4 w-4 text-amber-600" />
              Deactivate
            </DropdownMenuItem>
          )}
          {onAuditLog && (
            <DropdownMenuItem onClick={() => onAuditLog(item)} className="cursor-pointer">
              <span className="mr-2">📋</span>
              Audit Log
            </DropdownMenuItem>
          )}
          {onCollect && (
            <DropdownMenuItem onClick={() => onCollect(item)} className="cursor-pointer">
              <span className="mr-2">📥</span>
              Collect
            </DropdownMenuItem>
          )}
          {onAck && (
            <DropdownMenuItem onClick={() => onAck(item)} className="cursor-pointer">
              <span className="mr-2">✅</span>
              Acknowledge
            </DropdownMenuItem>
          )}
          {onValidate && (
            <DropdownMenuItem onClick={() => onValidate(item)} className="cursor-pointer">
              <span className="mr-2">✓</span>
              Validate
            </DropdownMenuItem>
          )}
          {onReject && (
            <DropdownMenuItem onClick={() => onReject(item)} className="cursor-pointer">
              <span className="mr-2">✕</span>
              Reject
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)} 
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Confirmation"
          description="Are you sure you want to delete this record?"
        />
      )}
    </>
  );
}