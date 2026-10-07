import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../../api/client';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Hash, Users, Trash2, Edit, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({ name: z.string().min(1, 'Name is required').max(100), description: z.string().max(500).optional() });

export function ProjectsPage({ createOpen = false }) {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(createOpen);
  const [editModalOpen, setEditModalOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading, error } = useQuery({ queryKey: ['projects'], queryFn: () => projectApi.list() });
  const createMutation = useMutation({ mutationFn: (d) => projectApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setCreateModalOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => projectApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setEditModalOpen(null); } });
  const deleteMutation = useMutation({ mutationFn: (id) => projectApi.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setDeleteConfirm(null); } });

  const createForm = useForm({ resolver: zodResolver(projectSchema), defaultValues: { name: '', description: '' } });
  const editForm = useForm({ resolver: zodResolver(projectSchema) });
  const projects = data?.data?.data || [];

  const openEdit = (project) => { editForm.reset({ name: project.name, description: project.description || '' }); setEditModalOpen(project); };

  return (
    <div className="space-y-4 pb-16 lg:pb-0">
      <div className="bg-white rounded-[8px] border border-[#DDDDDD] px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[#1D1C1D] flex items-center gap-2"><Hash className="w-5 h-5 text-[#4A154B]" /> Projects</h1>
          <p className="text-[13px] text-[#696969]">Channels for your work — manage and collaborate</p>
        </div>
        <Button variant="slack" size="sm" onClick={() => setCreateModalOpen(true)}><Plus className="w-4 h-4" /> New Project</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4A154B]" /></div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-[#E01E5A] text-[13px]">Failed to load projects</CardContent></Card>
      ) : projects.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <div className="mx-auto w-10 h-10 rounded-[6px] bg-[#F8F8F8] border border-[#DDDDDD] flex items-center justify-center"><Hash className="w-5 h-5 text-[#696969]" /></div>
          <h3 className="mt-3 font-bold text-[#1D1C1D]">No projects yet</h3>
          <p className="text-[13px] text-[#696969]">Create your first channel</p>
          <Button className="mt-4" variant="slack" onClick={() => setCreateModalOpen(true)}><Plus className="w-4 h-4" /> Create Project</Button>
        </CardContent></Card>
      ) : (
        <div className="bg-white rounded-[8px] border border-[#DDDDDD] divide-y divide-[#DDDDDD]">
          {projects.map((project) => (
            <div key={project._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8F8]">
              <span className="w-9 h-9 rounded-[6px] bg-[#1164A3] text-white flex items-center justify-center shrink-0"><Hash className="w-4 h-4" /></span>
              <div className="flex-1 min-w-0">
                <Link to={`/projects/${project._id}`} className="font-bold text-[15px] text-[#1D1C1D] hover:text-[#1264A3] hover:underline">{project.name}</Link>
                {project.description && <p className="text-[13px] text-[#696969] truncate">{project.description}</p>}
                <span className="text-[12px] text-[#696969] flex items-center gap-1 mt-0.5"><Users className="w-3.5 h-3.5" />{project.members || 1} members</span>
              </div>
              <Badge variant={project.role === 'admin' ? 'success' : 'default'} size="sm">{project.role?.replace('_', ' ') || 'member'}</Badge>
              {project.role === 'admin' && (
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(project)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(project._id)}><Trash2 className="w-4 h-4 text-[#E01E5A]" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create a channel">
        <p className="text-[13px] text-[#696969] mb-4">Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.</p>
        <form onSubmit={createForm.handleSubmit((d) => { createMutation.mutate(d); createForm.reset(); })} className="space-y-4">
          <Input label="Name" placeholder="e.g. plan-budget" error={createForm.formState.errors.name?.message} {...createForm.register('name')} />
          <Textarea label="Description (optional)" rows={3} placeholder="What’s this channel about?" {...createForm.register('description')} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button><Button type="submit" variant="slack" loading={createMutation.isPending}>Create</Button></div>
        </form>
      </Modal>

      <Modal isOpen={!!editModalOpen} onClose={() => setEditModalOpen(null)} title="Edit channel">
        <form onSubmit={editForm.handleSubmit((d) => { if (editModalOpen) updateMutation.mutate({ id: editModalOpen._id, data: d }); })} className="space-y-4">
          <Input label="Name" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Textarea label="Description (optional)" rows={3} {...editForm.register('description')} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setEditModalOpen(null)}>Cancel</Button><Button type="submit" variant="slack" loading={updateMutation.isPending}>Save Changes</Button></div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete channel" size="sm">
        <p className="text-[13px] text-[#696969]">Are you sure? This cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} loading={deleteMutation.isPending}>Delete</Button></div>
      </Modal>
    </div>
  );
}
