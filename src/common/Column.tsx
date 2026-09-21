import { useState, useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";


interface ColumnToggleProps<T> {
  table: Table<T>;
  excludeColumns?: string[];
  label?: string;
}

export default function ColumnToggle<T>({ 
  table, 
  excludeColumns = ["actions", "select"],
  label = "Show / Hide Columns"
}: ColumnToggleProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all leaf columns (excluding actions)
  const allColumns = table.getAllLeafColumns().filter(
    col => !excludeColumns.includes(col.id)
  );

  // Filter columns based on search
  const filteredColumns = allColumns.filter(column => 
    column.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get visible columns count
  const visibleCount = allColumns.filter(col => col.getIsVisible()).length;
  const totalCount = allColumns.length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Format column label
  const getColumnLabel = (id: string) => {
    const labels: Record<string, string> = {
      id: "Patient ID",
      name: "Name",
      age: "Age",
      gender: "Gender",
      condition: "Condition",
      status: "Status",
      lastVisit: "Last Visit",
      email: "Email",
      phone: "Phone",
      analyzerId: "Analyzer ID",
      analyzerName: "Analyzer Name",
      model: "Model",
      totalTests: "Total Tests",
      integrationDate: "Integration Date",
      lastCalibration: "Last Calibration",
    };
    return labels[id] || id.split(/(?=[A-Z])/).join(" ").replace(/^./, str => str.toUpperCase());
  };

  // Handle Show All
  const handleShowAll = () => {
    allColumns.forEach(col => col.toggleVisibility(true));
  };

  // Handle Hide All
  const handleHideAll = () => {
    allColumns.forEach(col => col.toggleVisibility(false));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <Settings size={16} className="text-gray-600" />
        <span className="text-sm text-gray-700">{label}</span>
        <Badge variant="secondary" className="ml-1 text-xs">
          {visibleCount}/{totalCount}
        </Badge>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-2 max-h-[400px] flex flex-col">
          {/* Header with Search and Actions */}
          <div className="border-b pb-2 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Columns
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleShowAll}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-0.5 hover:bg-blue-50 rounded"
                >
                  All
                </button>
                <button
                  onClick={handleHideAll}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-0.5 hover:bg-red-50 rounded"
                >
                  None
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
              <span>{visibleCount} visible</span>
              <span>•</span>
              <span>{totalCount - visibleCount} hidden</span>
            </div>
          </div>

          {/* Column List */}
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {filteredColumns.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">
                No columns found
              </div>
            ) : (
              filteredColumns.map((column) => {
                const isVisible = column.getIsVisible();
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={column.getToggleVisibilityHandler()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-gray-700">
                      {getColumnLabel(column.id)}
                    </span>
                    {!isVisible && (
                      <span className="text-xs text-gray-400">hidden</span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-2 mt-2">
            <button
              onClick={() => {
                table.resetColumnVisibility();
                setOpen(false);
              }}
              className="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-1 hover:bg-gray-50 rounded transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}