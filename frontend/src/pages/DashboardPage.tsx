import React, { useState, useEffect } from 'react';
import { Plus, Download, Users, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { LeadFilters, Lead } from '../types';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFiltersBar } from '../components/leads/LeadFilters';
import { Pagination } from '../components/leads/Pagination';
import { Modal } from '../components/ui/Modal';
import { LeadForm } from '../components/leads/LeadForm';
import { Button } from '../components/ui/Button';
import { StatusBadge, SourceBadge } from '../components/ui/Badge';
import { leadsApi, LeadStats } from '../api/leads';

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [filters, setFilters] = useState<LeadFilters>({ page: 1, limit: 10, sort: 'latest' });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [stats, setStats] = useState<LeadStats | null>(null);

  const { leads, meta, isLoading, error, refetch, deleteLead, exportCSV } = useLeads(filters);

  // Fetch real stats from the backend (not computed from current page)
  const fetchStats = async () => {
    try {
      const res = await leadsApi.getStats();
      if (res.data.data) setStats(res.data.data);
    } catch {
      // silently fail; stats are supplementary
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Re-fetch stats after a lead is mutated
  const handleMutate = () => {
    refetch();
    fetchStats();
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10, sort: 'latest' });
    setSearchInput('');
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await deleteLead(deleteId);
    setIsDeleteConfirm(false);
    setDeleteId('');
    fetchStats();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Stats — sourced from backend aggregate, not current page */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Leads" value={stats?.total ?? meta?.total ?? 0} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="New" value={stats?.byStatus.New ?? 0} color="bg-indigo-500" />
        <StatCard icon={UserCheck} label="Qualified" value={stats?.byStatus.Qualified ?? 0} color="bg-green-500" />
        <StatCard icon={UserX} label="Lost" value={stats?.byStatus.Lost ?? 0} color="bg-red-500" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {meta ? `${meta.total} total leads` : 'Manage your sales pipeline'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => { setSelectedLead(null); setIsFormOpen(true); }}>
            <Plus size={15} /> New Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LeadFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      {/* Table */}
      <LeadTable
        leads={leads}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />
      )}

      {/* Lead Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedLead(null); }}
        title={selectedLead ? 'Edit Lead' : 'Create New Lead'}
      >
        <LeadForm
          lead={selectedLead}
          onSuccess={() => { setIsFormOpen(false); setSelectedLead(null); handleMutate(); }}
          onCancel={() => { setIsFormOpen(false); setSelectedLead(null); }}
        />
      </Modal>

      {/* View Lead Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Lead Details">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Name</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedLead.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedLead.email}</p>
              </div>
              {selectedLead.phone && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLead.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Status</p>
                <StatusBadge status={selectedLead.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Source</p>
                <SourceBadge source={selectedLead.source} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedLead.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </p>
              </div>
            </div>
            {selectedLead.notes && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  {selectedLead.notes}
                </p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={() => { setIsViewOpen(false); handleEdit(selectedLead); }}
            >
              Edit Lead
            </Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={isDeleteConfirm} onClose={() => setIsDeleteConfirm(false)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={confirmDelete}>Delete</Button>
            <Button variant="secondary" onClick={() => setIsDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
