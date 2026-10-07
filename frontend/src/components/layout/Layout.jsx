import { Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../api/client';
import { Navbar } from './Navbar';

export function Layout() {
  const { data } = useQuery({ queryKey: ['health'], queryFn: () => healthApi.check(), retry: false, staleTime: 60000 });
  const healthy = !data || data.status === 200;
  return (
    <div className="min-h-screen flex bg-[#F8F8F8] text-[#1D1C1D]">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar — Slack-style channel header */}
        <div className="h-[44px] shrink-0 flex items-center gap-3 px-4 bg-white border-b border-[#DDDDDD] sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[15px]">
            <span className="font-bold text-[#1D1C1D] hidden sm:inline">ProjectCamp</span>
            <span className="text-[#696969] hidden sm:inline">/</span>
            <span className="text-[#696969] text-[13px] hidden md:inline">Where work happens — projects, tasks & notes in one place</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 text-xs text-[#696969] border border-[#DDDDDD] rounded-[6px] px-2.5 py-1 bg-[#F8F8F8]">
              <span className={`w-2 h-2 rounded-full inline-block ${healthy ? 'bg-[#2EB67D]' : 'bg-[#E01E5A]'}`} />
              {healthy ? 'All systems operational' : 'Service degraded'}
            </div>
          </div>
        </div>

        {/* Main fluid area + optional right panel slot */}
        <main className="flex-1 min-w-0 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>

        {/* Mobile bottom tab — Slack style */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#4A154B] text-white flex justify-around py-2 border-t border-white/10 z-20">
          <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-[11px] opacity-90">
            <span className="text-sm">⌂</span> Home
          </Link>
          <Link to="/projects" className="flex flex-col items-center gap-0.5 text-[11px] opacity-70">
            <span className="text-sm">#</span> Projects
          </Link>
          <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-[11px] opacity-70">
            <span className="text-sm">◉</span> You
          </Link>
        </div>
      </div>
    </div>
  );
}
