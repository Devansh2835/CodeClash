'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMetaMask } from '@/hooks/useMetaMask';
import toast from 'react-hot-toast';
import { auth } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { connect: connectMetaMask, connected: metamaskConnected } = useMetaMask();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.username, formData.email, formData.password);
      toast.success('Account created! Check your email for OTP.');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await auth.verifyOTP({ email: formData.email, otp });
      toast.success('Email verified! Redirecting...');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await auth.resendOTP({ email: formData.email });
      toast.success('OTP resent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    }
  };

  if (step === 'otp') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-3xl font-bold text-center mb-6">Verify Email</h1>
          <p className="text-center text-gray-400 mb-6">
            We sent a 6-digit code to {formData.email}
          </p>
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="input text-center text-2xl tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary w-full mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              className="btn btn-secondary w-full"
            >
              Resend OTP
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
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
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="input"
              required
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input"
              required
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
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="input"
              required
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
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-3">
            Optional: Connect MetaMask for betting
          </p>
          <button
            onClick={connectMetaMask}
            disabled={metamaskConnected}
            className="btn btn-secondary w-full"
          >
            {metamaskConnected ? '✓ MetaMask Connected' : 'Connect MetaMask'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-primary-400 hover:text-primary-300">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}