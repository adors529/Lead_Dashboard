
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LeadFilters as ILeadFilters } from '../../types';

interface LeadFiltersProps {
  filters: ILeadFilters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof ILeadFilters, value: string) => void;
  onClearFilters: () => void;
}

export const LeadFiltersBar = ({
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
  onClearFilters,
}: LeadFiltersProps) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || filters.sort !== 'latest';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            icon={<Search size={16} />}
          />
        </div>
        <Select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          placeholder="All Statuses"
          options={[
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Lost', label: 'Lost' },
          ]}
          className="sm:w-44"
        />
        <Select
          value={filters.source || ''}
          onChange={(e) => onFilterChange('source', e.target.value)}
          placeholder="All Sources"
          options={[
            { value: 'Website', label: 'Website' },
            { value: 'Instagram', label: 'Instagram' },
            { value: 'Referral', label: 'Referral' },
          ]}
          className="sm:w-40"
        />
        <Select
          value={filters.sort || 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          options={[
            { value: 'latest', label: 'Latest First' },
            { value: 'oldest', label: 'Oldest First' },
          ]}
          className="sm:w-40"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="whitespace-nowrap">
            <X size={14} /> Clear
          </Button>
        )}
      </div>
    </div>
  );
};
