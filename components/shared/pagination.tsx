import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  offset: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  offset,
  limit,
  onPageChange,
  isLoading
}: PaginationProps) {
  return (
    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-xs font-bold text-slate-400">
        Menampilkan <span className="text-slate-800">{Math.min(offset + 1, totalCount)}</span> - <span className="text-slate-800">{Math.min(offset + limit, totalCount)}</span> dari <span className="text-slate-800">{totalCount}</span> data
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-xl h-8 px-3"
        >
          <ChevronLeft size={14} /> Sebelumnya
        </Button>
        <div className="flex gap-1">
          {[...Array(Math.min(5, totalPages || 1))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "secondary" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-xl p-0",
                  currentPage === pageNum ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-xl h-8 px-3"
        >
          Selanjutnya <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
