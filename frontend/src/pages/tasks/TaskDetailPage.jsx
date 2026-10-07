import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../api/client';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Loader2, Trash2 } from 'lucide-react';

export function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [edit, setEdit] = useState({ title: '', description: '', status: 'todo' });
  const [initialized, setInitialized] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => taskApi.get(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
  const task = data?.data?.data;
  const subtasks = task?.subTasks || task?.subtasks || [];

  if (task && !initialized) {
    setEdit({ title: task.title || '', description: task.description || '', status: task.status || 'todo' });
    setInitialized(true);
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
  };

  const updateMutation = useMutation({ mutationFn: (d) => taskApi.update(projectId, taskId, d), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: () => taskApi.delete(projectId, taskId), onSuccess: () => navigate(`/projects/${projectId}`) });
  const createSubMutation = useMutation({ mutationFn: (title) => taskApi.createSubtask(projectId, taskId, { title }), onSuccess: () => { setSubtaskTitle(''); invalidate(); } });
  const toggleSubMutation = useMutation({ mutationFn: ({ id, isCompleted }) => taskApi.updateSubtask(projectId, id, { isCompleted }), onSuccess: invalidate });
  const deleteSubMutation = useMutation({ mutationFn: (id) => taskApi.deleteSubtask(projectId, id), onSuccess: invalidate });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error || !task) return <Card><CardContent className="py-12 text-center text-[13px] text-[#E01E5A]">Task not found. <Link to={`/projects/${projectId}`} className="underline">Back</Link></CardContent></Card>;

  return (
    <div className="space-y-4 pb-16 lg:pb-0">
      <Link to={`/projects/${projectId}`} className="text-[13px] text-[#1264A3] hover:underline">← Back to project</Link>
      <Card>
        <CardContent className="space-y-4">
          <Input label="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          <Textarea label="Description" rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          <label className="block text-[13px] font-bold">Status</label>
          <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} className="w-full px-3 py-2 border rounded-[6px] bg-white text-[15px]">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="flex gap-2">
            <Button variant="slack" size="sm" onClick={() => updateMutation.mutate(edit)} loading={updateMutation.isPending}>Save</Button>
            <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isPending}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
          </div>
          {task.attachments?.length > 0 && (
            <div className="text-[13px]">
              <p className="font-bold mb-1">Attachments ({task.attachments.length})</p>
              {task.attachments.map((a, i) => <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block text-[#1264A3] hover:underline truncate">{a.url}</a>)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-bold text-[15px] mb-3">Subtasks ({subtasks.length})</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="New subtask title" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} />
            <Button size="sm" variant="slack" onClick={() => subtaskTitle.trim() && createSubMutation.mutate(subtaskTitle.trim())} loading={createSubMutation.isPending}>Add</Button>
          </div>
          <div className="space-y-2">
            {subtasks.map((s) => (
              <div key={s._id} className="flex items-center gap-2 px-2 py-1.5 border rounded-[6px]">
                <input type="checkbox" checked={!!s.isCompleted} onChange={(e) => toggleSubMutation.mutate({ id: s._id, isCompleted: e.target.checked })} />
                <span className={`flex-1 text-[13px] ${s.isCompleted ? 'line-through text-[#696969]' : ''}`}>{s.title}</span>
                <button onClick={() => deleteSubMutation.mutate(s._id)} className="text-[#E01E5A] text-[12px]">Delete</button>
              </div>
            ))}
            {subtasks.length === 0 && <p className="text-[13px] text-[#696969]">No subtasks yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
