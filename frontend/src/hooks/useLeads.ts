import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/leads';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import toast from 'react-hot-toast';

export const useLeads = (filters: LeadFilters) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await leadsApi.getLeads(filters);
      setLeads(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch {
      setError('Failed to fetch leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const deleteLead = async (id: string) => {
    try {
      await leadsApi.deleteLead(id);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await leadsApi.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return { leads, meta, isLoading, error, refetch: fetchLeads, deleteLead, exportCSV };
};
