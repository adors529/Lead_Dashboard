import React, { useState } from 'react';
import { BarChart3, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { UserRole } from '../types';

interface Props {
  onSwitchToLogin: () => void;
}

export const RegisterPage = ({ onSwitchToLogin }: Props) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'sales' as UserRole });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <BarChart3 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join SmartLeads Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" icon={<User size={16} />} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" icon={<Mail size={16} />} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" icon={<Lock size={16} />} />
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'sales', label: 'Sales User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
};
