import { Task, Project, User } from '../types';
import { LayoutDashboard, CheckCircle2, CircleDollarSign, Loader2, AlertCircle, Clock, Calendar, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  selectedProject: Project | null;
}

export default function Dashboard({ tasks, projects, users, selectedProject }: DashboardProps) {
  
  // Status breakdown counters
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const inReviewCount = tasks.filter(t => t.status === 'In Review').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  // Priority counts
  const highPriorityCount = tasks.filter(t => t.priority === 'High').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'Medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'Low').length;

  // Get current date string form YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Overdue Tasks logic (dueDate list items which are not done before today's string)
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed');

  // Compute percentage completed
  const completedPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            {selectedProject ? `${selectedProject.name} Dashboard` : 'Unified Workspace Dashboard'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {selectedProject 
              ? `${tasks.length} active tasks in this project scope` 
              : `Coordinating across ${projects.length} team projects`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Completion</span>
            <span className="text-lg font-mono font-bold text-indigo-400">{completedPercentage}%</span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-slate-950 flex items-center justify-center relative bg-slate-900/80">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-1000"
                strokeDasharray={`${completedPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-slate-300">{completedPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric Card 1 */}
        <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Tasks</span>
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800/40 text-slate-400 text-xs">SUM</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-white">{totalTasks}</div>
          <div className="text-[10px] text-slate-500 mt-2">Aggregated system tasks</div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-400">Completed</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-teal-400">{completedCount}</div>
          <div className="text-[10px] text-teal-500/80 mt-2">Ready to deliver</div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Currently Active</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-amber-400">{inProgressCount + inReviewCount}</div>
          <div className="text-[10px] text-amber-500/80 mt-2">In Progress & In Review</div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-slate-900/25 border border-rose-950/40 rounded-2xl p-5 hover:border-rose-900/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400">Overdue Alert</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-rose-400">{overdueTasks.length}</div>
          <div className="text-[10px] text-rose-400/80 mt-2">Passed scheduled due date</div>
        </div>

      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Breakdown Bar chart mock indicators */}
        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-6">Task Status Allocation</h3>
          <div className="space-y-4">
            
            {/* ProgressBar 1 */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>To Do</span>
                <span className="font-semibold text-slate-200">{todoCount} tasks ({totalTasks > 0 ? Math.round((todoCount/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: `${totalTasks > 0 ? (todoCount/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            {/* ProgressBar 2 */}
            <div>
              <div className="flex justify-between text-xs text-amber-400 mb-1.5">
                <span>In Progress</span>
                <span className="font-semibold text-amber-300">{inProgressCount} tasks ({totalTasks > 0 ? Math.round((inProgressCount/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalTasks > 0 ? (inProgressCount/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            {/* ProgressBar 3 */}
            <div>
              <div className="flex justify-between text-xs text-indigo-400 mb-1.5">
                <span>In Review</span>
                <span className="font-semibold text-indigo-300">{inReviewCount} tasks ({totalTasks > 0 ? Math.round((inReviewCount/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalTasks > 0 ? (inReviewCount/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            {/* ProgressBar 4 */}
            <div>
              <div className="flex justify-between text-xs text-teal-400 mb-1.5">
                <span>Completed</span>
                <span className="font-semibold text-teal-300">{completedCount} tasks ({totalTasks > 0 ? Math.round((completedCount/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${totalTasks > 0 ? (completedCount/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

          </div>
        </div>

        {/* Priority Segment Panel */}
        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-6">Task Priority Distribution</h3>
          <div className="space-y-4">
            
            {/* Priority Indicator - High */}
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-300">High Priority</span>
              </div>
              <span className="text-xs font-bold font-mono text-rose-400">{highPriorityCount}</span>
            </div>

            {/* Priority Indicator - Medium */}
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-300">Medium Priority</span>
              </div>
              <span className="text-xs font-bold font-mono text-amber-400">{mediumPriorityCount}</span>
            </div>

            {/* Priority Indicator - Low */}
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-300">Low Priority</span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-400">{lowPriorityCount}</span>
            </div>

          </div>
        </div>

      </div>

      {/* Critical Overdue Section */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            Overdue Deliverables Check
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">{overdueTasks.length} Active Overdue</span>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="bg-slate-950/40 rounded-xl p-6 text-center border border-slate-800/40">
            <p className="text-xs text-slate-500 italic">No tasks are currently overdue. Everything is on schedule!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {overdueTasks.map(task => {
              const projName = projects.find(p => p.id === task.projectId)?.name || 'Project';
              const assigneeName = users.find(u => u.id === task.assignedToId)?.name || 'Unassigned';
              return (
                <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/15 gap-4 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-200">{task.title}</span>
                      <span className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-medium">{projName}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] block text-slate-500 font-semibold">Assignee</span>
                      <span className="text-xs text-slate-300 font-medium">{assigneeName}</span>
                    </div>
                    <div className="bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1.5 text-rose-400 font-mono text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
