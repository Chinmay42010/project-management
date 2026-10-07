import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  fullName: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setError(null); setIsLoading(true);
    try { await registerUser({ username: data.username, email: data.email, password: data.password, fullName: data.fullName }); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed. Please try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[420px] shrink-0 bg-[#4A154B] text-white flex-col p-10">
        <div className="flex items-center gap-2 text-xl font-bold"><span className="w-8 h-8 rounded bg-white text-[#4A154B] flex items-center justify-center text-sm">◈</span> ProjectCamp</div>
        <div className="mt-16">
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em]">Made for<br />teams that<br />ship</h1>
          <p className="mt-4 text-white/80">Create your workspace — channels for projects, threads for decisions.</p>
          <div className="mt-8 flex gap-2"><span className="w-3 h-3 rounded-full bg-[#36C5F0]" /><span className="w-3 h-3 rounded-full bg-[#2EB67D]" /><span className="w-3 h-3 rounded-full bg-[#ECB22E]" /><span className="w-3 h-3 rounded-full bg-[#E01E5A]" /></div>
        </div>
        <p className="mt-auto text-xs text-white/60">Free workspace — no credit card</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-[#F8F8F8]">
        <div className="w-full max-w-[440px] bg-white rounded-[8px] border border-[#DDDDDD] p-6 sm:p-8 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#1D1C1D]">Create an account</h2>
          <p className="text-[13px] text-[#696969] mt-1">Start managing projects today</p>
          {error && <div className="mt-4 p-3 text-[13px] text-[#E01E5A] bg-[#E01E5A]/10 border border-[#E01E5A]/20 rounded-[6px]" role="alert">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
            <Input label="Username" placeholder="johndoe" autoComplete="username" error={errors.username?.message} {...register('username')} />
            <Input label="Full Name (optional)" placeholder="John Doe" autoComplete="name" {...register('fullName')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" className="w-full mt-2" variant="slack" loading={isLoading}>Create account</Button>
          </form>
          <p className="mt-6 text-center text-[13px] text-[#696969]">Already have an account? <Link to="/login" className="font-bold text-[#1264A3] hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
