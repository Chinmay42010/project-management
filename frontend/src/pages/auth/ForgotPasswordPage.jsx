import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({ email: z.string().min(1, 'Email is required').email('Invalid email') });

export function ForgotPasswordPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setError(null); setStatus(null);
    try {
      const res = await authApi.forgotPassword(email);
      setStatus(res.data?.message || 'Reset email sent. Check your inbox.');
    } catch (err) { setError(err.response?.data?.message || 'Request failed.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F8F8]">
      <div className="w-full max-w-[420px] bg-white rounded-[8px] border border-[#DDDDDD] p-6 sm:p-8">
        <h2 className="text-[22px] font-bold">Forgot password</h2>
        <p className="text-[13px] text-[#696969] mt-1">We’ll email you a reset link.</p>
        {error && <div className="mt-4 p-3 text-[13px] text-[#E01E5A] bg-[#E01E5A]/10 border border-[#E01E5A]/20 rounded-[6px]">{error}</div>}
        {status && <div className="mt-4 p-3 text-[13px] text-[#2EB67D] bg-[#2EB67D]/10 border border-[#2EB67D]/20 rounded-[6px]">{status}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" variant="slack">Send reset link</Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-[#696969]"><Link to="/login" className="font-bold text-[#1264A3] hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
