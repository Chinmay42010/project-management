import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  newPassword: z.string().min(1, 'Password is required'),
  confirm: z.string().min(1, 'Confirm your password'),
}).refine((d) => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ newPassword }) => {
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
      navigate('/login');
    } catch (err) { setError(err.response?.data?.message || 'Reset failed or link expired.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F8F8]">
      <div className="w-full max-w-[420px] bg-white rounded-[8px] border border-[#DDDDDD] p-6 sm:p-8">
        <h2 className="text-[22px] font-bold">Reset password</h2>
        <p className="text-[13px] text-[#696969] mt-1">Choose a new password.</p>
        {error && <div className="mt-4 p-3 text-[13px] text-[#E01E5A] bg-[#E01E5A]/10 border border-[#E01E5A]/20 rounded-[6px]">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="New password" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
          <Input label="Confirm password" type="password" error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" className="w-full" variant="slack">Reset password</Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-[#696969]"><Link to="/login" className="font-bold text-[#1264A3] hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
