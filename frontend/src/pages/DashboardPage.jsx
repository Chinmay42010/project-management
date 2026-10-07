import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Hash, Users, Clock, ArrowRight, Plus, MessageSquare } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['projects'], queryFn: () => projectApi.list() });
  const projects = data?.data?.data || [];
  const stats = { total: projects.length, active: projects.filter((p) => p.members && p.members > 1).length, owned: projects.filter((p) => p.role === 'admin').length };

  return (
    <div className="space-y-4 pb-16 lg:pb-0">
      {/* Slack-style header */}
      <div className="bg-white rounded-[8px] border border-[#DDDDDD] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-[6px] bg-[#4A154B] text-white flex items-center justify-center font-bold">#</span>
          <div>
            <h1 className="text-[18px] font-bold text-[#1D1C1D] leading-none">Dashboard</h1>
            <p className="text-[13px] text-[#696969]">Overview of your projects and activity</p>
          </div>
        </div>
        <Link to="/projects/new"><Button size="sm" variant="slack"><Plus className="w-4 h-4" /> New Project</Button></Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Total Projects', value: stats.total, dot: 'bg-[#4A154B]', icon: Hash },
          { label: 'Collaborative', value: stats.active, dot: 'bg-[#2EB67D]', icon: Users },
          { label: 'Owned by You', value: stats.owned, dot: 'bg-[#1164A3]', icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <CardContent className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#696969]">{s.label}</p>
                <p className="text-[22px] font-bold text-[#1D1C1D] leading-none mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDDDDD]">
          <h2 className="text-[15px] font-bold text-[#1D1C1D] flex items-center gap-2"><Hash className="w-4 h-4 text-[#696969]" /> Your projects</h2>
          <Link to="/projects" className="text-[13px] font-bold text-[#1264A3] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4A154B]" /></div>
          ) : error ? (
            <div className="text-center py-10 text-[#E01E5A] text-[13px]">Failed to load projects</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto w-10 h-10 rounded-[6px] bg-[#F8F8F8] border border-[#DDDDDD] flex items-center justify-center"><Hash className="w-5 h-5 text-[#696969]" /></div>
              <h3 className="mt-3 font-bold text-[#1D1C1D]">No projects yet</h3>
              <p className="text-[13px] text-[#696969]">Create a channel-like project to get started</p>
              <Link to="/projects/new" className="mt-3 inline-flex text-[13px] font-bold text-[#1264A3] hover:underline gap-1 items-center">Create Project <ArrowRight className="w-4 h-4" /></Link>
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#F8F8F8] rounded-[6px] group border border-transparent hover:border-[#DDDDDD]">
                  <span className="w-9 h-9 rounded-[6px] bg-[#4A154B] text-white flex items-center justify-center shrink-0 mt-0.5"><Hash className="w-4 h-4" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#1D1C1D] group-hover:text-[#1264A3] truncate">{project.name}</span>
                      <Badge variant={project.role === 'admin' ? 'success' : 'default'} size="sm">{project.role?.replace('_', ' ') || 'member'}</Badge>
                    </div>
                    {project.description && <p className="text-[13px] text-[#696969] line-clamp-1">{project.description}</p>}
                    <div className="flex items-center gap-3 text-[12px] text-[#696969] mt-1">
                      {project.members !== undefined && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.members} members</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
