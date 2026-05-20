
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';
import { Button } from '../ui/Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> leads
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage}>
          <ChevronLeft size={16} />
        </Button>
        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          if (pageNum > totalPages) return null;
          return (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="w-8 !px-0"
            >
              {pageNum}
            </Button>
          );
        })}
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNextPage}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
