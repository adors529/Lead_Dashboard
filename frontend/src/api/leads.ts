import api from './axios';
import { ApiResponse, Lead, LeadFilters } from '../types';

export interface LeadStats {
  total: number;
  byStatus: { New: number; Contacted: number; Qualified: number; Lost: number };
  bySource: { Website: number; Instagram: number; Referral: number };
}

export const leadsApi = {
  getLeads: (filters: LeadFilters) =>
    api.get<ApiResponse<Lead[]>>('/leads', { params: filters }),
  getLeadById: (id: string) =>
    api.get<ApiResponse<Lead>>(`/leads/${id}`),
  createLead: (data: Partial<Lead>) =>
    api.post<ApiResponse<Lead>>('/leads', data),
  updateLead: (id: string, data: Partial<Lead>) =>
    api.put<ApiResponse<Lead>>(`/leads/${id}`, data),
  deleteLead: (id: string) =>
    api.delete<ApiResponse<null>>(`/leads/${id}`),
  exportCSV: () =>
    api.get('/leads/export/csv', { responseType: 'blob' }),
  getStats: () =>
    api.get<ApiResponse<LeadStats>>('/leads/stats'),
};
