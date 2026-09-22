import React from 'react'
import type { StudentRecord } from '@/data/mockStudents'
import { CheckCircle2, Clock, UserCheck } from 'lucide-react'

interface BulkUpdatePreviewTableProps {
  records: StudentRecord[]
}

export const BulkUpdatePreviewTable: React.FC<BulkUpdatePreviewTableProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
        <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          No matching records found
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          Enter application numbers or range and click "Preview Records"
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Selected Records: <span className="text-blue-600 dark:text-blue-400">{records.length}</span>
        </span>
        <span className="text-[11px] text-slate-400">Read-only preview</span>
      </div>

      <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3 border-b border-slate-200 dark:border-slate-700">Appln No</th>
              <th className="py-2 px-3 border-b border-slate-200 dark:border-slate-700">Student Name</th>
              <th className="py-2 px-3 border-b border-slate-200 dark:border-slate-700">Status</th>
              <th className="py-2 px-3 border-b border-slate-200 dark:border-slate-700">Branch</th>
              <th className="py-2 px-3 border-b border-slate-200 dark:border-slate-700">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-3 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                  {rec.registrationNumber || rec.id}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {rec.studentName}
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.applicationStatus === 'Declared'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200'
                        : rec.applicationStatus === 'Approved'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200'
                          : rec.applicationStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {rec.applicationStatus === 'Declared' && <CheckCircle2 className="h-3 w-3" />}
                    {rec.applicationStatus === 'Pending' && <Clock className="h-3 w-3" />}
                    {rec.applicationStatus}
                  </span>
                </td>
                <td className="py-2 px-3 whitespace-nowrap">{rec.schoolBranch}</td>
                <td className="py-2 px-3 whitespace-nowrap">{rec.academicYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
