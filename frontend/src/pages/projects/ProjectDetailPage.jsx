import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
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
import { Plus, Users, Trash2, Edit, FileText, CheckCircle, Clock, Loader2, Send, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const memberSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'project_admin', 'member']),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  assignedTo: z.string().optional(),
});

const noteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);

  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId),
    enabled: !!projectId,
  });

  const { data: membersData } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectApi.listMembers(projectId),
    enabled: !!projectId,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => taskApi.list(projectId),
    enabled: !!projectId,
  });

  const { data: notesData } = useQuery({
    queryKey: ['project-notes', projectId],
    queryFn: () => noteApi.list(projectId),
    enabled: !!projectId,
  });

  const project = projectData?.data?.data;
  const members = membersData?.data?.data || [];
  const tasks = tasksData?.data?.data || [];
  const notes = notesData?.data?.data || [];

  const updateMutation = useMutation({
    mutationFn: (data) => projectApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data) => projectApi.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      setAddMemberModalOpen(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setCreateTaskModalOpen(false);
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => noteApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-notes', projectId] });
      setCreateNoteModalOpen(false);
    },
  });

  const editForm = useForm({
    resolver: zodResolver(z.object({ name: z.string().min(1), description: z.string().optional() })),
    defaultValues: { name: project?.name || '', description: project?.description || '' },
  });

  const memberForm = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: '', role: 'member' },
  });

  const taskForm = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', status: 'todo', assignedTo: '' },
  });

  const noteForm = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: '' },
  });

  const handleEditSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleAddMember = (data) => {
    addMemberMutation.mutate(data);
    memberForm.reset({ email: '', role: 'member' });
  };

  const handleCreateTask = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('status', data.status);
    if (data.assignedTo) formData.append('assignedTo', data.assignedTo);
    createTaskMutation.mutate(formData);
    taskForm.reset({ title: '', description: '', status: 'todo', assignedTo: '' });
  };

  const handleCreateNote = (data) => {
    createNoteMutation.mutate(data);
    noteForm.reset({ content: '' });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600 dark:text-red-400">
          Project not found
        </CardContent>
      </Card>
    );
  }

  const isAdmin = project.role === 'admin';

  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2 inline-block">
            ← All Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          {project.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks <Badge variant="default" className="ml-2">{tasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes <Badge variant="default" className="ml-2">{notes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="members">
            Members <Badge variant="default" className="ml-2">{members.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">To Do</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{todoTasks}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <Loader2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressTasks}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Done</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{doneTasks}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <Badge variant={project.role === 'admin' ? 'success' : 'info'} className="mt-1">
                    {project.role?.replace('_', ' ') || 'member'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button onClick={() => setCreateTaskModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {['todo', 'in_progress', 'done'].map((status) => (
              <Card key={status}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">{status.replace('_', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 min-h-[200px]">
                    {tasks.filter((t) => t.status === status).map((task) => (
                      <Link key={task._id} to={`/projects/${projectId}/tasks/${task._id}`} className="block">
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
                          {task.assignedTo && typeof task.assignedTo === 'object' && (
                            <div className="mt-2 flex items-center gap-2">
                              <Avatar name={task.assignedTo.fullName || task.assignedTo.username} size="xs" src={task.assignedTo.avatar?.url} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {task.assignedTo.fullName || task.assignedTo.username}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    {tasks.filter((t) => t.status === status).length === 0 && (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">No tasks</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notes</h2>
            {isAdmin && (
              <Button onClick={() => setCreateNoteModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No notes yet</h3>
                  {isAdmin && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Create your first note</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              notes.map((note) => (
                <Card key={note._id}>
                  <CardContent className="pt-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                          {note.content}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Avatar name={note.createdBy.fullName || note.createdBy.username} size="xs" src={note.createdBy.avatar?.url} />
                            {note.createdBy.fullName || note.createdBy.username}
                          </span>
                          <span>
                            <Clock className="w-4 h-4 inline" />
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Members</h2>
            {isAdmin && (
              <Button onClick={() => setAddMemberModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <Card key={member._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={member.user.fullName || member.user.username} size="md" src={member.user.avatar?.url} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user.fullName || member.user.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === 'admin' ? 'success' : member.role === 'project_admin' ? 'info' : 'default'}>
                    {member.role.replace('_', ' ')}
                  </Badge>
                  {isAdmin && member.user._id !== project.createdBy._id && (
                    <Button variant="ghost" size="sm" onClick={() => removeMemberMutation.mutate(member.user._id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Project">
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
          <Input label="Name" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Textarea label="Description (optional)" rows={3} {...editForm.register('description')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Project" size="sm">
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{project.name}"? This action cannot be undone and will remove all tasks, notes, and members.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteMutation.mutate} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal isOpen={addMemberModalOpen} onClose={() => setAddMemberModalOpen(false)} title="Add Member">
        <form onSubmit={memberForm.handleSubmit(handleAddMember)} className="space-y-4">
          <Input label="Email" type="email" error={memberForm.formState.errors.email?.message} {...memberForm.register('email')} />
          <select {...memberForm.register('role')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="member">Member</option>
            <option value="project_admin">Project Admin</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={createTaskModalOpen} onClose={() => setCreateTaskModalOpen(false)} title="Create Task">
        <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-4">
          <Input label="Title" error={taskForm.formState.errors.title?.message} {...taskForm.register('title')} />
          <Textarea label="Description (optional)" rows={3} {...taskForm.register('description')} />
          <select {...taskForm.register('status')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <Input label="Assigned To (user ID, optional)" {...taskForm.register('assignedTo')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={createNoteModalOpen} onClose={() => setCreateNoteModalOpen(false)} title="Create Note">
        <form onSubmit={noteForm.handleSubmit(handleCreateNote)} className="space-y-4">
          <Textarea label="Content" rows={6} error={noteForm.formState.errors.content?.message} {...noteForm.register('content')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createNoteMutation.isPending}>
              Create Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}