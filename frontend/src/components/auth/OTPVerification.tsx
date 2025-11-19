'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

interface OTPVerificationProps {
  email: string;
  onSuccess?: () => void;
}

export default function OTPVerification({ email, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await auth.verifyOTP({ email, otp });
      toast.success('Email verified successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    try {
      await auth.resendOTP({ email });
      toast.success('OTP resent to your email');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-400">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            className="input text-center text-2xl tracking-widest"
            maxLength={6}
            required
            disabled={loading}
            autoFocus
          />
          <p className="text-sm text-gray-400 text-center mt-2">
            Code expires in 10 minutes
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0}
          className="text-primary-400 hover:text-primary-300 text-sm flex items-center justify-center mx-auto"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`}
          />
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : resendLoading
            ? 'Sending...'
            : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}