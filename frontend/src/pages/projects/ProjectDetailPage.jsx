import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { projectApi, taskApi, noteApi } from '../../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Hash, Users, Trash2, Edit, FileText, Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const memberSchema = z.object({ email: z.string().email('Invalid email'), role: z.enum(['admin', 'project_admin', 'member']) });
const taskSchema = z.object({ title: z.string().min(1, 'Title is required'), description: z.string().optional(), status: z.enum(['todo', 'in_progress', 'done']).default('todo'), assignedTo: z.string().optional() });
const noteSchema = z.object({ content: z.string().min(1, 'Content is required') });

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery({ queryKey: ['project', projectId], queryFn: () => projectApi.get(projectId), enabled: !!projectId });
  const { data: membersData } = useQuery({ queryKey: ['project-members', projectId], queryFn: () => projectApi.listMembers(projectId), enabled: !!projectId });
  const { data: tasksData } = useQuery({ queryKey: ['project-tasks', projectId], queryFn: () => taskApi.list(projectId), enabled: !!projectId });
  const { data: notesData } = useQuery({ queryKey: ['project-notes', projectId], queryFn: () => noteApi.list(projectId), enabled: !!projectId });

  const project = projectData?.data?.data;
  const members = membersData?.data?.data || [];
  const tasks = tasksData?.data?.data || [];
  const notes = notesData?.data?.data || [];

  const updateMutation = useMutation({ mutationFn: (d) => projectApi.update(projectId, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', projectId] }); queryClient.invalidateQueries({ queryKey: ['projects'] }); setEditModalOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: () => projectApi.delete(projectId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); navigate('/projects'); } });
  const addMemberMutation = useMutation({ mutationFn: (d) => projectApi.addMember(projectId, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project-members', projectId] }); setAddMemberModalOpen(false); } });
  const removeMemberMutation = useMutation({ mutationFn: (userId) => projectApi.removeMember(projectId, userId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-members', projectId] }) });
  const roleMutation = useMutation({ mutationFn: ({ userId, newRole }) => projectApi.updateMemberRole(projectId, userId, newRole), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-members', projectId] }) });
  const createTaskMutation = useMutation({ mutationFn: (d) => taskApi.create(projectId, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] }); setCreateTaskModalOpen(false); } });
  const deleteTaskMutation = useMutation({ mutationFn: (taskId) => taskApi.delete(projectId, taskId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] }) });
  const createNoteMutation = useMutation({ mutationFn: (d) => noteApi.create(projectId, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] }); setCreateNoteModalOpen(false); } });
  const updateNoteMutation = useMutation({ mutationFn: ({ noteId, content }) => noteApi.update(projectId, noteId, { content }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] }); setEditingNote(null); } });
  const deleteNoteMutation = useMutation({ mutationFn: (noteId) => noteApi.delete(projectId, noteId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] }) });

  const editForm = useForm({ resolver: zodResolver(z.object({ name: z.string().min(1), description: z.string().optional() })), defaultValues: { name: project?.name || '', description: project?.description || '' } });
  const memberForm = useForm({ resolver: zodResolver(memberSchema), defaultValues: { email: '', role: 'member' } });
  const taskForm = useForm({ resolver: zodResolver(taskSchema), defaultValues: { title: '', description: '', status: 'todo', assignedTo: '' } });
  const noteForm = useForm({ resolver: zodResolver(noteSchema), defaultValues: { content: '' } });

  if (projectLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-[#4A154B]" /></div>;
  if (projectError || !project) return <Card><CardContent className="py-12 text-center text-[#E01E5A] text-[13px]">Project not found</CardContent></Card>;

  const isAdmin = project.role === 'admin';
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-4 pb-16 lg:pb-0">
      {/* Channel header */}
      <div className="bg-white rounded-[8px] border border-[#DDDDDD] px-4 py-3">
        <Link to="/projects" className="text-[13px] text-[#1264A3] hover:underline">← All channels</Link>
        <div className="flex items-start justify-between gap-4 mt-1">
          <div className="flex gap-3">
            <span className="w-9 h-9 rounded-[6px] bg-[#4A154B] text-white flex items-center justify-center shrink-0"><Hash className="w-5 h-5" /></span>
            <div>
              <h1 className="text-[18px] font-bold text-[#1D1C1D] leading-none">{project.name}</h1>
              {project.description && <p className="text-[13px] text-[#696969] mt-1">{project.description}</p>}
              <p className="text-[12px] text-[#696969] mt-1 flex items-center gap-2"><Users className="w-3.5 h-3.5" />{members.length} members · Created {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}><Edit className="w-3.5 h-3.5" /> Edit</Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#DDDDDD] overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks <span className="ml-1.5 bg-[#E01E5A] text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold">{tasks.length}</span></TabsTrigger>
            <TabsTrigger value="notes">Notes <span className="ml-1.5 bg-[#1164A3] text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold">{notes.length}</span></TabsTrigger>
            <TabsTrigger value="members">Members <span className="ml-1.5 bg-[#2EB67D] text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold">{members.length}</span></TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="overview">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: 'To Do', value: todoTasks, color: 'bg-[#ECB22E]' },
                  { label: 'In Progress', value: inProgressTasks, color: 'bg-[#36C5F0]' },
                  { label: 'Done', value: doneTasks, color: 'bg-[#2EB67D]' },
                ].map((s) => (
                  <Card key={s.label} padding="sm"><CardContent className="flex items-center gap-3"><span className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><div><p className="text-[13px] text-[#696969]">{s.label}</p><p className="text-[22px] font-bold text-[#1D1C1D] leading-none">{s.value}</p></div></CardContent></Card>
                ))}
              </div>
              <Card className="mt-4" padding="sm">
                <CardHeader><CardTitle>Channel details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 text-[13px]">
                    <div><p className="text-[#696969]">Role</p><Badge variant={project.role === 'admin' ? 'success' : 'info'} className="mt-1">{project.role?.replace('_', ' ') || 'member'}</Badge></div>
                    <div><p className="text-[#696969]">Members</p><p className="font-bold text-[#1D1C1D] mt-1">{members.length}</p></div>
                    <div><p className="text-[#696969]">Created</p><p className="text-[#1D1C1D] mt-1">{new Date(project.createdAt).toLocaleDateString()}</p></div>
                    <div><p className="text-[#696969]">Updated</p><p className="text-[#1D1C1D] mt-1">{new Date(project.updatedAt).toLocaleDateString()}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold">Tasks</h2>
                <Button onClick={() => setCreateTaskModalOpen(true)} size="sm" variant="slack"><Plus className="w-3.5 h-3.5" /> New Task</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {['todo', 'in_progress', 'done'].map((status) => (
                  <Card key={status} padding="sm">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2"><span className={`w-2 h-2 rounded-full ${status === 'todo' ? 'bg-[#ECB22E]' : status === 'in_progress' ? 'bg-[#36C5F0]' : 'bg-[#2EB67D]'}`} /><CardTitle className="capitalize text-[13px]">{status.replace('_', ' ')}</CardTitle><span className="ml-auto text-xs text-[#696969]">{tasks.filter((t) => t.status === status).length}</span></CardHeader>
                    <CardContent>
                      <div className="space-y-2 min-h-[160px]">
                        {tasks.filter((t) => t.status === status).map((task) => (
                          <div key={task._id} className="p-2.5 rounded-[6px] border border-[#DDDDDD] hover:bg-[#F8F8F8] bg-white">
                            <Link to={`/projects/${projectId}/tasks/${task._id}`} className="block">
                              <h4 className="font-bold text-[13px] text-[#1D1C1D] truncate">{task.title}</h4>
                              {task.assignedTo && typeof task.assignedTo === 'object' && (
                                <div className="mt-1.5 flex items-center gap-1.5"><Avatar name={task.assignedTo.fullName || task.assignedTo.username} size="xs" src={task.assignedTo.avatar?.url} /><span className="text-[12px] text-[#696969] truncate">{task.assignedTo.fullName || task.assignedTo.username}</span></div>
                              )}
                            </Link>
                            <button onClick={() => deleteTaskMutation.mutate(task._id)} className="mt-1 text-[12px] text-[#E01E5A] hover:underline">Delete</button>
                          </div>
                        ))}
                        {tasks.filter((t) => t.status === status).length === 0 && <div className="text-center py-6 text-[#696969] text-[13px]">No tasks</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold">Notes</h2>
                {isAdmin && <Button onClick={() => setCreateNoteModalOpen(true)} size="sm" variant="slack"><Plus className="w-3.5 h-3.5" /> New Note</Button>}
              </div>
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <Card><CardContent className="py-10 text-center"><FileText className="mx-auto h-8 w-8 text-[#DDDDDD]" /><h3 className="mt-2 font-bold text-[#1D1C1D] text-[13px]">No notes yet</h3>{isAdmin && <p className="text-[13px] text-[#696969]">Create your first note</p>}</CardContent></Card>
                ) : notes.map((note) => (
                  <div key={note._id} className="flex gap-3 px-3 py-3 hover:bg-[#F8F8F8] rounded-[6px] border border-transparent hover:border-[#DDDDDD]">
                    <Avatar name={note.createdBy.fullName || note.createdBy.username} size="sm" src={note.createdBy.avatar?.url} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px] text-[#1D1C1D]">{note.createdBy.fullName || note.createdBy.username}</span>
                        <span className="text-[11px] text-[#696969]">{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {editingNote === note._id ? (
                        <form onSubmit={(e) => { e.preventDefault(); updateNoteMutation.mutate({ noteId: note._id, content: e.target.content.value }); }} className="mt-1 flex gap-2">
                          <input name="content" defaultValue={note.content} className="flex-1 px-2 py-1 border rounded-[6px] text-[13px]" />
                          <Button size="sm" variant="slack" type="submit" loading={updateNoteMutation.isPending}>Save</Button>
                          <Button size="sm" variant="secondary" type="button" onClick={() => setEditingNote(null)}>Cancel</Button>
                        </form>
                      ) : (
                        <div className="text-[15px] text-[#1D1C1D] whitespace-pre-wrap mt-1 leading-[1.5]">{note.content}</div>
                      )}
                    </div>
                    {isAdmin && editingNote !== note._id && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditingNote(note._id)} className="text-[12px] text-[#1264A3] hover:underline">Edit</button>
                        <button onClick={() => deleteNoteMutation.mutate(note._id)} className="text-[12px] text-[#E01E5A] hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold">Members — {members.length}</h2>
                {isAdmin && <Button onClick={() => setAddMemberModalOpen(true)} size="sm" variant="slack"><Plus className="w-3.5 h-3.5" /> Add Member</Button>}
              </div>
              <div className="divide-y divide-[#DDDDDD] border border-[#DDDDDD] rounded-[8px] overflow-hidden">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between px-3 py-2.5 bg-white hover:bg-[#F8F8F8]">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.user.fullName || member.user.username} size="sm" src={member.user.avatar?.url} />
                      <div>
                        <p className="font-bold text-[13px] text-[#1D1C1D]">{member.user.fullName || member.user.username}</p>
                        <p className="text-[12px] text-[#696969]">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'success' : member.role === 'project_admin' ? 'info' : 'default'}>{member.role.replace('_', ' ')}</Badge>
                      {isAdmin && member.user._id !== project.createdBy._id && (
                        <>
                          <select value={member.role} onChange={(e) => roleMutation.mutate({ userId: member.user._id, newRole: e.target.value })} className="text-[12px] border rounded-[6px] px-1 py-0.5 bg-white">
                            <option value="member">Member</option>
                            <option value="project_admin">Project Admin</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button variant="ghost" size="sm" onClick={() => removeMemberMutation.mutate(member.user._id)}><Trash2 className="w-3.5 h-3.5 text-[#E01E5A]" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {members.length === 0 && <div className="py-8 text-center text-[13px] text-[#696969]">No members</div>}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit channel">
        <form onSubmit={editForm.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
          <Input label="Name" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Textarea label="Description (optional)" rows={3} {...editForm.register('description')} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button><Button type="submit" variant="slack" loading={updateMutation.isPending}>Save Changes</Button></div>
        </form>
      </Modal>

      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete channel" size="sm">
        <p className="text-[13px] text-[#696969]">Delete "#{project.name}"? This will remove all tasks, notes, and members.</p>
        <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button><Button variant="danger" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isPending}>Delete</Button></div>
      </Modal>

      <Modal isOpen={addMemberModalOpen} onClose={() => setAddMemberModalOpen(false)} title="Add people">
        <form onSubmit={memberForm.handleSubmit((d) => { addMemberMutation.mutate(d); memberForm.reset({ email: '', role: 'member' }); })} className="space-y-4">
          <Input label="Email" type="email" error={memberForm.formState.errors.email?.message} {...memberForm.register('email')} />
          <label className="block text-[13px] font-bold text-[#1D1C1D]">Role</label>
          <select {...memberForm.register('role')} className="w-full px-3 py-2 border border-[#1D1C1D]/30 rounded-[6px] bg-white text-[15px] focus:ring-2 focus:ring-[#1264A3]"><option value="member">Member</option><option value="project_admin">Project Admin</option><option value="admin">Admin</option></select>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setAddMemberModalOpen(false)}>Cancel</Button><Button type="submit" variant="slack" loading={addMemberMutation.isPending}>Add</Button></div>
        </form>
      </Modal>

      <Modal isOpen={createTaskModalOpen} onClose={() => setCreateTaskModalOpen(false)} title="Create task">
        <form onSubmit={taskForm.handleSubmit((d) => { const fd = new FormData(); fd.append('title', d.title); if (d.description) fd.append('description', d.description); fd.append('status', d.status); if (d.assignedTo) fd.append('assignedTo', d.assignedTo); createTaskMutation.mutate(fd); taskForm.reset({ title: '', description: '', status: 'todo', assignedTo: '' }); })} className="space-y-4">
          <Input label="Title" error={taskForm.formState.errors.title?.message} {...taskForm.register('title')} />
          <Textarea label="Description (optional)" rows={3} {...taskForm.register('description')} />
          <label className="block text-[13px] font-bold text-[#1D1C1D]">Status</label>
          <select {...taskForm.register('status')} className="w-full px-3 py-2 border border-[#1D1C1D]/30 rounded-[6px] bg-white text-[15px]"><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select>
          <Input label="Assigned To (user ID, optional)" {...taskForm.register('assignedTo')} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setCreateTaskModalOpen(false)}>Cancel</Button><Button type="submit" variant="slack" loading={createTaskMutation.isPending}>Create</Button></div>
        </form>
      </Modal>

      <Modal isOpen={createNoteModalOpen} onClose={() => setCreateNoteModalOpen(false)} title="New message">
        <form onSubmit={noteForm.handleSubmit((d) => { createNoteMutation.mutate(d); noteForm.reset({ content: '' }); })} className="space-y-4">
          <Textarea label="Message" rows={5} placeholder="Write a message..." error={noteForm.formState.errors.content?.message} {...noteForm.register('content')} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setCreateNoteModalOpen(false)}>Cancel</Button><Button type="submit" variant="slack" loading={createNoteMutation.isPending}>Send</Button></div>
        </form>
      </Modal>
    </div>
  );
}
