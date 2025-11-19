'use client';

import { useState } from 'react';
import { Mail, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface SignupFormProps {
  onSuccess?: (email: string) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.username, formData.email, formData.password);
      toast.success('Account created! Check your email for OTP.');
      onSuccess?.(formData.email);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">
          <User className="w-4 h-4 inline mr-2" />
          Username
        </label>
        <input
          type="text"
          placeholder="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="input"
          required
          disabled={loading}
          minLength={3}
          maxLength={20}
        />
      </div>

      <div>
        <label className="label">
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="label">
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input"
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <div>
        <label className="label">
          <Lock className="w-4 h-4 inline mr-2" />
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="input"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Sign Up'
        )}
      </button>
    </form>
  );
}