import React, { useState } from 'react';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { leadsApi } from '../../api/leads';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface LeadFormProps {
  lead?: Lead | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource | '';
  notes: string;
}

export const LeadForm = ({ lead, onSuccess, onCancel }: LeadFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    status: lead?.status || 'New',
    source: lead?.source || '',
    notes: lead?.notes || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim() || formData.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Valid email is required';
    if (formData.phone && !/^[+\d\s\-()]{7,15}$/.test(formData.phone))
      newErrors.phone = 'Enter a valid phone number';
    if (!formData.source) newErrors.source = 'Source is required';
    if (formData.notes && formData.notes.length > 500)
      newErrors.notes = 'Notes cannot exceed 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload: Partial<Lead> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        status: formData.status,
        source: formData.source as LeadSource,
        notes: formData.notes || undefined,
      };
      if (lead) {
        await leadsApi.updateLead(lead._id, payload);
        toast.success('Lead updated successfully');
      } else {
        await leadsApi.createLead(payload);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter lead name"
        error={errors.name}
      />
      <Input
        label="Email Address *"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="lead@example.com"
        error={errors.email}
      />
      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+91 98765 43210 (optional)"
        error={errors.phone}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Lost', label: 'Lost' },
          ]}
        />
        <Select
          label="Source *"
          name="source"
          value={formData.source}
          onChange={handleChange}
          placeholder="Select source"
          options={[
            { value: 'Website', label: 'Website' },
            { value: 'Instagram', label: 'Instagram' },
            { value: 'Referral', label: 'Referral' },
          ]}
          error={errors.source}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Optional notes about this lead..."
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition sm:text-sm px-3 py-2 resize-none"
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        <p className="mt-1 text-xs text-gray-400">{formData.notes.length}/500</p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {lead ? 'Update Lead' : 'Create Lead'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
