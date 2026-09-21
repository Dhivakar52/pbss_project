import { toast } from "@/components/ui/toast";

export const notify = {
  saveSuccess: (message = "Record saved successfully.") => {
    toast.success(message);
  },
  updateSuccess: (message = "Record updated successfully.") => {
    toast.success(message);
  },
  deleteSuccess: (message = "Record deleted successfully.") => {
    toast.delete(message);
  },
  draftSuccess: (message = "Draft saved successfully.") => {
    toast.success(message);
  },
  approveSuccess: (message = "Record approved successfully.") => {
    toast.success(message);
  },
  rejectSuccess: (message = "Record rejected successfully.") => {
    toast.warning(message);
  },
  validationError: (message = "Please fill all mandatory fields.") => {
    toast.validation(message);
  },
  serverError: (message = "Failed to save the record. Please try again.") => {
    toast.error(message);
  },
  apiError: (message = "Something went wrong. Please contact the administrator.") => {
    toast.error(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
};
