import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: localStorage.getItem('rememberedEmail') || '' },
  });

  const onSubmit = async (data) => {
    setError(null); setIsLoading(true);
    try {
      if (rememberMe) localStorage.setItem('rememberedEmail', data.email);
      else localStorage.removeItem('rememberedEmail');
      await login(data.email, data.password); navigate('/dashboard');
    }
    catch (err) { setError(err.response?.data?.message || 'Login failed. Please try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left brand panel — Slack purple */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-[#4A154B] text-white flex-col p-10">
        <div className="flex items-center gap-2 text-xl font-bold"><span className="w-8 h-8 rounded bg-white text-[#4A154B] flex items-center justify-center text-sm">◈</span> ProjectCamp</div>
        <div className="mt-16">
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em]">Where work<br />happens</h1>
          <p className="mt-4 text-white/80 text-[16px]">Sign in to your workspace and keep projects, tasks and notes in one calm place.</p>
          <div className="mt-8 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#36C5F0]" /><span className="w-3 h-3 rounded-full bg-[#2EB67D]" /><span className="w-3 h-3 rounded-full bg-[#ECB22E]" /><span className="w-3 h-3 rounded-full bg-[#E01E5A]" />
          </div>
        </div>
        <p className="mt-auto text-xs text-white/60">© {new Date().getFullYear()} ProjectCamp — Slack-inspired theme</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-[#F8F8F8]">
        <div className="w-full max-w-[420px] bg-white rounded-[8px] border border-[#DDDDDD] p-6 sm:p-8 shadow-sm">
          <div className="text-center lg:text-left">
            <h2 className="text-[22px] font-bold text-[#1D1C1D]">Welcome back</h2>
            <p className="text-[13px] text-[#696969] mt-1">Sign in to your workspace</p>
          </div>
          {error && <div className="mt-4 p-3 text-[13px] text-[#E01E5A] bg-[#E01E5A]/10 border border-[#E01E5A]/20 rounded-[6px]" role="alert">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[#1D1C1D]"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-[#DDDDDD] text-[#1264A3]" /> Remember me</label>
              <Link to="/forgot-password" className="text-[13px] font-bold text-[#1264A3] hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" variant="slack" loading={isLoading}>Sign in</Button>
          </form>
          <p className="mt-6 text-center text-[13px] text-[#696969]">Don't have an account? <Link to="/register" className="font-bold text-[#1264A3] hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
