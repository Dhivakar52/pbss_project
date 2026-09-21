export interface StatusConfig {
  [key: string]: {
    label: string;
    color: string;
    bgColor: string;
    borderColor?: string;
    icon?: React.ReactNode;
  }
}

export const STATUS_CONFIG: StatusConfig = {
  // Patient Status
  active: {
    label: 'Active',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  
  // Appointment Status
  scheduled: {
    label: 'Scheduled',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
  },
  arrived: {
    label: 'Arrived',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
  },
  'no-show': {
    label: 'No Show',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  
  // Payment Status
  paid: {
    label: 'Paid',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-100',
    borderColor: 'border-fuchsia-200',
  },
  partial: {
    label: 'Partial',
    color: 'text-lime-700',
    bgColor: 'bg-lime-100',
    borderColor: 'border-lime-200',
  },
  
  // Department Status
  available: {
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  busy: {
    label: 'Busy',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  offline: {
    label: 'Offline',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  on_leave: {
    label: 'On Leave',
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-200',
  },
  
  // Inventory Status
  in_stock: {
    label: 'In Stock',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  low_stock: {
    label: 'Low Stock',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  out_of_stock: {
    label: 'Out of Stock',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  discontinued: {
    label: 'Discontinued',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  
  // Admission Status
  admitted: {
    label: 'Admitted',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  discharged: {
    label: 'Discharged',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  transferred: {
    label: 'Transferred',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  stable: {
    label: 'Stable',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
  
  // Laboratory Status
  pending_result: {
    label: 'Pending Result',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  results_ready: {
    label: 'Results Ready',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  abnormal: {
    label: 'Abnormal',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  normal: {
    label: 'Normal',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
}