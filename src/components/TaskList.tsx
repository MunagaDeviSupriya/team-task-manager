import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types';
import { List, Kanban, Plus, AlertCircle, Trash2, Edit2, Calendar, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  project: Project;
  users: User[];
  currentUser: User;
  onCreateTask: (title: string, description: string, assignedToId: string, priority: TaskPriority, dueDate: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Completed'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export default function TaskList({
  tasks,
  project,
  users,
  currentUser,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: TaskListProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const handleOpenCreateForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    // Default assignee to first user in project selection
    const firstProjectMember = users.find(u => project.memberIds.includes(u.id))?.id || currentUser.id;
    setAssignedToId(firstProjectMember);
    setPriority('Medium');
    // Default due date to 3 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    setDueDate(futureDate.toISOString().split('T')[0]);
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssignedToId(task.assignedToId);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedToId || !priority || !dueDate) {
      setError('Please fill in all core fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (editingTask) {
        await onUpdateTask(editingTask.id, {
          title,
          description,
          assignedToId,
          priority,
          dueDate
        });
      } else {
        await onCreateTask(title, description, assignedToId, priority, dueDate);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await onUpdateTask(task.id, { status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await onDeleteTask(taskId);
      } catch (err: any) {
        alert(err.message || 'Deletion failed');
      }
    }
  };

  // Filter project members
  const projectMembers = users.filter(u => project.memberIds.includes(u.id));

  // Render priority color dots/text
  const getPriorityBadgeClass = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">

      {/* Task Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Tasks in "{project.name}"
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure, prioritize, and track task status columns below
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Modes */}
          <div className="bg-slate-950/85 p-1 rounded-xl border border-slate-800/80 flex items-center shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Task creation only for Admins */}
          {isAdmin && (
            <button
              onClick={handleOpenCreateForm}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/15 transition-all focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Expandable Creation Form */}
      {isFormOpen && (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              {editingTask ? `Modify Task parameters` : `Draft new task inside ${project.name}`}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-semibold py-1 px-2.5 bg-slate-950/40 border border-slate-800 hover:border-slate-700/60 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement checkout wizard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Detailed Scope Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail step-by-step design criteria, API calls description, or validation benchmarks..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Assign To Member</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-505 transition-all"
                >
                  {projectMembers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                  {projectMembers.length === 0 && (
                    <option value={currentUser.id}>{currentUser.name} (Direct self assignment)</option>
                  )}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                  * Only members assigned to the parent project scope are selecting targets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-505 transition-all animate-none"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-505 transition-all text-center pr-3"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-5.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {submitting ? 'Preserving...' : editingTask ? 'Update Task' : 'Produce Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Task listings */}
      {tasks.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
          <CheckCircle2 className="w-8 h-8 mx-auto text-indigo-400/40 mb-2.5" />
          <p className="text-xs font-semibold">Zero tasks found in this project.</p>
          {isAdmin && (
            <p className="text-[11px] text-slate-500 mt-1">Ready to delegate? Press "Add Task" to declare the scope.</p>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        
        /* KANBAN BOARD LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 align-stretch">
          {STATUSES.map(colStatus => {
            const columnTasks = tasks.filter(t => t.status === colStatus);

            return (
              <div key={colStatus} className="bg-slate-950/40 rounded-2xl border border-slate-900 p-4 flex flex-col min-h-[400px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900/80 select-none">
                  <span className="text-xs font-bold text-slate-300">{colStatus}</span>
                  <span className="text-[10px] font-bold font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map(task => {
                    const taskImg = users.find(u => u.id === task.assignedToId)?.avatarUrl || '';
                    const taskName = users.find(u => u.id === task.assignedToId)?.name || 'Unassigned';
                    const isAssignee = task.assignedToId === currentUser.id;
                    const canStatusEdit = isAdmin || isAssignee;

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-900/45 border hover:border-slate-700/60 border-slate-800/80 rounded-xl p-4 gap-3 select-none transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Title & Priority Header */}
                          <div className="flex items-start justify-between gap-2.5">
                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full select-none uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                            
                            {/* Admin actions inside cards */}
                            {isAdmin && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEditForm(task)}
                                  className="p-1 hover:bg-slate-800/60 rounded text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white mt-2.5 break-words line-clamp-2">{task.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 font-normal leading-relaxed">{task.description}</p>
                        </div>

                        {/* Status update controller & Assignee picker */}
                        <div className="border-t border-slate-900/85 mt-4 pt-3 space-y-2.5">
                          
                          {/* Assignee display */}
                          <div className="flex items-center gap-2">
                            <img
                              src={taskImg || `https://api.dicebear.com/7.x/initials/svg?seed=${taskName}`}
                              alt={taskName}
                              referrerPolicy="no-referrer"
                              className="w-4.5 h-4.5 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-slate-300 font-medium block truncate leading-tight">{taskName}</span>
                              {isAssignee && (
                                <span className="inline-block text-[8px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded border border-indigo-500/10">
                                  Your Assignment
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Status dropdown */}
                          <div>
                            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Update Status</span>
                            {canStatusEdit ? (
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                className="w-full bg-slate-950 border border-slate-800/80 hover:border-slate-700/60 rounded-lg py-1 px-2 text-[10px] text-slate-300 cursor-pointer focus:outline-none transition-all font-medium"
                              >
                                {STATUSES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[10px] text-slate-500 italic pl-1 leading-normal select-none">
                                View Only (Assigned to {taskName})
                              </div>
                            )}
                          </div>

                          {/* Due Date Indicator */}
                          <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-slate-500 pl-0.5 select-none pt-0.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>Due {task.dueDate}</span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* STANDARD LIST VIEW */
        <div className="bg-slate-900/10 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] font-bold font-mono tracking-wider uppercase">
                <tr>
                  <th className="py-4.5 px-5">Task Details</th>
                  <th className="py-4.5 px-4">Status</th>
                  <th className="py-4.5 px-4">Priority</th>
                  <th className="py-4.5 px-4">Assigned To</th>
                  <th className="py-4.5 px-4">Due Date</th>
                  {isAdmin && <th className="py-4.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map(task => {
                  const taskImg = users.find(u => u.id === task.assignedToId)?.avatarUrl || '';
                  const taskName = users.find(u => u.id === task.assignedToId)?.name || 'Unassigned';
                  const isAssignee = task.assignedToId === currentUser.id;
                  const canStatusEdit = isAdmin || isAssignee;

                  return (
                    <tr key={task.id} className="hover:bg-slate-900/20 transition-all">
                      {/* Name & desc */}
                      <td className="py-4 px-5">
                        <div className="min-w-[200px] max-w-sm">
                          <span className="font-bold text-white text-xs block">{task.title}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal font-normal">
                            {task.description || 'No supplementary details provided.'}
                          </span>
                        </div>
                      </td>

                      {/* Status select dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {canStatusEdit ? (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                            className="bg-slate-950 border border-slate-800/80 hover:border-slate-700/60 rounded-lg py-1 px-2.5 text-[10px] text-slate-200 focus:outline-none cursor-pointer transition-all font-medium"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-950 text-slate-400 rounded-lg font-medium text-[10px] leading-none">
                            {task.status}
                          </span>
                        )}
                      </td>

                      {/* Priority badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Assigned member */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={taskImg || `https://api.dicebear.com/7.x/initials/svg?seed=${taskName}`}
                            alt={taskName}
                            referrerPolicy="no-referrer"
                            className="w-4.5 h-4.5 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-semibold block text-[11px] leading-tight text-slate-200">{taskName}</span>
                            {isAssignee && <span className="text-[8px] text-indigo-400 font-bold block leading-none mt-0.5">Assigned to You</span>}
                          </div>
                        </div>
                      </td>

                      {/* Due date */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[10px] font-semibold text-slate-400">
                        {task.dueDate}
                      </td>

                      {/* Admin inline actions */}
                      {isAdmin && (
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditForm(task)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-400 transition-all cursor-pointer border border-slate-800/40"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-all cursor-pointer border border-slate-800/40"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
