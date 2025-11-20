'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await auth.forgotPassword({ email });
      toast.success('Reset code sent to your email!');
      setStep('otp');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Account not found. Please sign up first.');
        setTimeout(() => router.push('/signup'), 2000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to send reset code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center text-gray-400 hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4"
            >
              {step === 'email' && <Mail className="w-8 h-8 text-white" />}
              {step === 'otp' && <Shield className="w-8 h-8 text-white" />}
              {step === 'reset' && <Lock className="w-8 h-8 text-white" />}
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify Code'}
              {step === 'reset' && 'New Password'}
            </h1>
          </div>

          {step === 'email' && (
            <motion.form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              </motion.button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form onSubmit={handleVerifyOTP} className="space-y-6">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-red-500 focus:outline-none"
                maxLength={6}
                required
              />
              <motion.button
                type="submit"
                disabled={otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-4 rounded-xl disabled:opacity-50"
              >
                Verify Code
              </motion.button>
            </motion.form>
          )}

          {step === 'reset' && (
            <motion.form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-red-500 focus:outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                required
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </motion.button>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}