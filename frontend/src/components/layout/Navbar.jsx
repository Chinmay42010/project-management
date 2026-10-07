import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Hash, Lock, ChevronDown, Plus, Home, FolderKanban, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../../api/client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['projects'], queryFn: () => projectApi.list() });
  const projects = data?.data?.data || [];

  const SidebarContent = () => (
    <>
      {/* Workspace switcher */}
      <div className="h-[44px] flex items-center gap-2 px-3 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-[6px] bg-white text-[#4A154B] flex items-center justify-center font-bold text-[16px]">◈</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] leading-none truncate">ProjectCamp</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
          </div>
          <span className="text-[12px] opacity-70 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2EB67D] inline-block" /> {user?.fullName || user?.username}
          </span>
        </div>
        <Link to="/projects/new" className="w-8 h-8 rounded-full bg-white text-[#4A154B] flex items-center justify-center hover:bg-white/90" title="New project">
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      {/* Compose / New */}
      <div className="px-3 py-3">
        <Link to="/projects/new" className="flex items-center gap-2 bg-white text-[#4A154B] rounded-full px-3 py-1.5 text-[13px] font-medium hover:bg-white/90 w-fit shadow-sm">
          <Plus className="w-3.5 h-3.5" /> New project
        </Link>
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-4 overflow-y-auto slack-scrollbar flex-1">
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[13px] font-semibold opacity-80">Home</span>
          </div>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-[6px] text-[15px] ${isActive ? 'bg-[#1164A3] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                }
              >
                <item.icon className="w-4 h-4 opacity-80" /> {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[13px] font-semibold opacity-80">Channels</span>
            <Link to="/projects/new" className="p-1 hover:bg-white/10 rounded" title="New project"><Plus className="w-3.5 h-3.5 opacity-70" /></Link>
          </div>
          <div className="space-y-0.5">
            {projects.length === 0 ? (
              <span className="px-2 py-1 text-[13px] text-white/60">No projects yet — create one</span>
            ) : (
              projects.slice(0, 12).map((p) => (
                <NavLink
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded-[6px] text-[15px] truncate ${isActive ? 'bg-[#1164A3] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  <Hash className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span className="truncate">{p.name}</span>
                  {p.role === 'admin' && <Lock className="w-3 h-3 opacity-40 ml-auto shrink-0" />}
                </NavLink>
              ))
            )}
            {projects.length > 12 && (
              <span className="px-2 text-xs text-white/50">+{projects.length - 12} more</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[13px] font-semibold opacity-80">Direct messages</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 text-[15px] text-white/80">
            <span className="w-6 h-6 rounded-[4px] bg-[#1164A3] flex items-center justify-center text-xs font-bold">{(user?.fullName || user?.username || 'U')[0]?.toUpperCase()}</span>
            <span className="truncate">{user?.fullName || user?.username}</span>
            <span className="text-[11px] opacity-60 ml-auto">you</span>
          </div>
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-white/10 p-2 mt-auto">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/10">
          <div className="w-7 h-7 rounded-[4px] bg-[#2EB67D] flex items-center justify-center text-xs font-bold text-white">{(user?.fullName || 'U')[0].toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium leading-none truncate">{user?.fullName || user?.username}</p>
            <p className="text-[11px] opacity-60 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded hover:bg-white/10" title="Sign out"><LogOut className="w-4 h-4 opacity-70" /></button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-[44px] bg-[#4A154B] text-white flex items-center px-3 z-30">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2"><Menu className="w-5 h-5" /></button>
        <span className="font-bold ml-2">ProjectCamp</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[280px] shrink-0 bg-[#4A154B] text-white flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="w-[280px] bg-[#4A154B] text-white flex flex-col h-full">
            <div className="h-[44px] flex items-center justify-between px-3 border-b border-white/10">
              <span className="font-bold">ProjectCamp</span>
              <button onClick={() => setMobileOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
      {/* spacer for mobile top bar */}
      <div className="lg:hidden h-[44px] shrink-0 lg:h-0" />
    </>
  );
}
