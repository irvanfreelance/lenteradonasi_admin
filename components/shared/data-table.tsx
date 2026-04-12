import * as React from "react"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
}

export function DataTable<T>({
  columns,
  data = [],
  isLoading,
  emptyMessage = "No data found.",
  className,
  rowClassName
}: DataTableProps<T>) {
  return (
    <div className={cn("bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden text-left", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={cn(
                    "px-6 py-5 border-b border-slate-100 font-black tracking-wider uppercase",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="h-20 px-6 py-4 bg-slate-50/10"></td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item, i) => (
                <tr 
                  key={i} 
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    rowClassName
                  )}
                >
                  {columns.map((col, j) => (
                    <td key={j} className={cn("px-6 py-6 text-sm font-medium", col.className)}>
                      {col.cell ? col.cell(item, i) : (col.accessorKey ? (item as any)[col.accessorKey] : null)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-8 py-20 text-center text-slate-400 italic font-bold"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
