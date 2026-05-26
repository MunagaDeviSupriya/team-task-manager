import React, { useState, useEffect } from 'react';
import { api } from './api';
import { User, Project, Task, ActivityLog, Role, TaskPriority } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import TaskList from './components/TaskList';
import TeamManagement from './components/TeamManagement';
import ActivityLogView from './components/ActivityLogView';
import { 
  LogOut, 
  Briefcase, 
  CheckSquare, 
  Users, 
  History, 
  LayoutDashboard, 
  Sparkles, 
  FolderLock,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Application database states
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Navigation & context states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'team' | 'logs'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Boot validation: check if token exists and fetch user
  useEffect(() => {
    async function validateSession() {
      if (api.isAuthenticated()) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        } catch (err) {
          console.warn('Session token stale, clearing.', err);
          api.logout();
        }
      }
      setLoadingAuth(false);
    }
    validateSession();
  }, []);

  // Fetch core telemetry states once an authenticated session is active
  const fetchWorkspaceData = async () => {
    if (!currentUser) return;
    setWorkspaceError(null);
    try {
      const [uList, pList] = await Promise.all([
        api.getUsers(),
        api.getProjects()
      ]);

      setUsers(uList);
      setProjects(pList);

      // Auto-select first project if nothing selected and projects are available
      if (pList.length > 0 && !selectedProject) {
        setSelectedProject(pList[0]);
      } else if (pList.length > 0 && selectedProject) {
        // Refresh selected project details
        const stillExists = pList.find(p => p.id === selectedProject.id);
        if (stillExists) {
          setSelectedProject(stillExists);
        } else {
          setSelectedProject(pList[0]);
        }
      }
    } catch (e: any) {
      console.error('Failed to load workspace directory:', e);
      const msg = e?.message || 'An unexpected error occurred';
      setWorkspaceError(msg);
      // If error is authentication/access-related, log out after a brief delay
      const msgLower = msg.toLowerCase();
      if (
        msgLower.includes('token') || 
        msgLower.includes('auth') || 
        msgLower.includes('permission') || 
        msgLower.includes('access') ||
        msgLower.includes('unauthorized') ||
        msgLower.includes('401') ||
        msgLower.includes('403') ||
        msgLower.includes('expired')
      ) {
        setTimeout(() => {
          handleLogout();
        }, 1500);
      }
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [currentUser]);

  // Load project-specific details when selecting a different project
  useEffect(() => {
    async function loadProjectDetails() {
      if (!currentUser || !selectedProject) {
        setTasks([]);
        setLogs([]);
        return;
      }
      try {
        const [taskList, logList] = await Promise.all([
          api.getTasks(selectedProject.id),
          api.getLogs(selectedProject.id)
        ]);
        setTasks(taskList);
        setLogs(logList);
      } catch (err) {
        console.error('Failed to load project elements:', err);
      }
    }
    loadProjectDetails();
  }, [selectedProject, currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSelectedProject(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
    setLogs([]);
    setActiveTab('dashboard');
  };

  // Rest API handlers mapping
  const handleCreateProject = async (name: string, description: string, memberIds: string[]) => {
    await api.createProject(name, description, memberIds);
    await fetchWorkspaceData();
  };

  const handleUpdateProject = async (id: string, name: string, description: string, memberIds: string[]) => {
    await api.updateProject(id, name, description, memberIds);
    await fetchWorkspaceData();
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
    await fetchWorkspaceData();
  };

  const handleCreateTask = async (title: string, description: string, assignedToId: string, priority: TaskPriority, dueDate: string) => {
    if (!selectedProject) return;
    await api.createTask(selectedProject.id, title, description, assignedToId, priority, dueDate);
    // Reload task lists & log history
    const [taskList, logList] = await Promise.all([
      api.getTasks(selectedProject.id),
      api.getLogs(selectedProject.id)
    ]);
    setTasks(taskList);
    setLogs(logList);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await api.updateTask(id, updates);
    if (selectedProject) {
      const [taskList, logList] = await Promise.all([
        api.getTasks(selectedProject.id),
        api.getLogs(selectedProject.id)
      ]);
      setTasks(taskList);
      setLogs(logList);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    if (selectedProject) {
      const [taskList, logList] = await Promise.all([
        api.getTasks(selectedProject.id),
        api.getLogs(selectedProject.id)
      ]);
      setTasks(taskList);
      setLogs(logList);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: Role) => {
    await api.updateUserRole(userId, role);
    await fetchWorkspaceData();
  };

  // Loading Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Validating workspace session...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!currentUser) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-600/30">
      
      {/* GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-900 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl shadow-lg shadow-indigo-600/5">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">Team Task Manager</span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase leading-none mt-0.5">Secure Board Sandbox</span>
            </div>
          </div>

          {/* Quick Info & User profile box */}
          <div className="flex items-center gap-4">
            
            {/* User Details */}
            <div className="hidden md:flex items-center gap-3 bg-slate-950/40 py-1.5 pl-3 pr-4 border border-slate-905 rounded-xl">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-800"
              />
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-slate-200 block">{currentUser.name}</span>
                <span className={`inline-flex items-center gap-1 text-[8px] font-extrabold uppercase mt-1 tracking-wider ${
                  currentUser.role === 'Admin' ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  <UserCheck className="w-2.5 h-2.5" />
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-500/10 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-900 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Nav Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl md:hidden text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

          </div>
        </div>
      </header>

      {/* WEB WORKSPACE LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {workspaceError && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex gap-3">
              <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 animate-pulse" />
              <div>
                <h3 className="text-xs font-extrabold uppercase text-rose-400 tracking-wider">Failed to Load Workspace Directory</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {workspaceError}. If your session token is expired or stale, you will be redirected to the sign-in portal.
                </p>
              </div>
            </div>
            <div className="flex bg-slate-950/40 p-1 border border-slate-900 rounded-xl gap-1 shrink-0 max-sm:w-full">
              <button
                onClick={fetchWorkspaceData}
                className="px-3 py-2 text-[10px] font-extrabold tracking-wider uppercase text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-lg cursor-pointer transition-all"
              >
                Retry
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* NAVIGATION COLUMN (Left Rail) */}
          <div className={`space-y-6 ${mobileMenuOpen ? 'block' : 'hidden md:block'} lg:col-span-1`}>
            
            {/* Global tabs list */}
            <div className="bg-slate-900/30 p-2.5 rounded-2xl border border-slate-900 space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block mb-2 px-3">Primary Navigation</span>
              
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                Workspace Dash
              </button>

              <button
                onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                  activeTab === 'projects' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4.5 h-4.5" />
                  Projects Directory
                </div>
                <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-md font-mono font-extrabold text-slate-400">
                  {projects.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                  activeTab === 'team' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4.5 h-4.5" />
                  Team Colleagues
                </div>
                <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-md font-mono font-extrabold text-slate-400">
                  {users.length}
                </span>
              </button>
            </div>

            {/* Active Project specific tabs list */}
            <div className="bg-slate-900/30 p-2.5 rounded-2xl border border-slate-900 space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block px-3">Active Project Board</span>
              
              {/* Project selector dropdown */}
              <div className="px-1.5 pb-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 pl-0.5">Focus Project ID</label>
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const matched = projects.find(p => p.id === e.target.value);
                    if (matched) setSelectedProject(matched);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-505 cursor-pointer transition-all font-semibold"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  {projects.length === 0 && (
                    <option value="">Zero active projects</option>
                  )}
                </select>
              </div>

              {selectedProject ? (
                <div className="space-y-1">
                  <button
                    onClick={() => { setActiveTab('tasks'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                      activeTab === 'tasks' 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4.5 h-4.5" />
                      Tasks Board
                    </div>
                    {tasks.length > 0 && (
                      <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-md font-mono font-extrabold text-slate-400">
                        {tasks.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('logs'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                      activeTab === 'logs' 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <History className="w-4.5 h-4.5" />
                    Revision History
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic px-3 select-none leading-relaxed">
                  Select or launch a project first to access project task boards and revision logs.
                </p>
              )}
            </div>

            {/* Bottom Credit card info */}
            <div className="bg-radial from-slate-900 to-indigo-950/20 border border-slate-900 rounded-2xl p-4.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase mb-1 tracking-wider">
                <Sparkles className="w-4.5 h-4.5 shrink-0" />
                <span>Role-Based Sandbox</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-normal">
                You are currently signed in with <strong className="text-white">{currentUser.role}</strong> authorization details. Use tabs to navigate files.
              </p>
            </div>

          </div>

          {/* DYNAMIC PRESENTATION WORKSPACE (Right Screen) */}
          <main className="col-span-1 lg:col-span-3 min-h-[500px]">
            {activeTab === 'dashboard' && (
              <Dashboard 
                tasks={selectedProject ? tasks : []} 
                projects={projects} 
                users={users} 
                selectedProject={selectedProject}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectList
                projects={projects}
                users={users}
                currentUser={currentUser}
                onProjectSelect={(p) => {
                  setSelectedProject(p);
                  setActiveTab('tasks');
                }}
                selectedProject={selectedProject}
                onCreateProject={handleCreateProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === 'team' && (
              <TeamManagement
                users={users}
                currentUser={currentUser}
                onUpdateUserRole={handleUpdateUserRole}
              />
            )}

            {activeTab === 'tasks' && selectedProject && (
              <TaskList
                tasks={tasks}
                project={selectedProject}
                users={users}
                currentUser={currentUser}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'logs' && selectedProject && (
              <ActivityLogView
                logs={logs}
                projectId={selectedProject.id}
              />
            )}

            {/* Error fallback panels */}
            {activeTab === 'tasks' && !selectedProject && (
              <div className="bg-slate-900/20 rounded-2xl p-12 border border-slate-900 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                <Briefcase className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="font-bold text-white text-sm mb-1.5">No Project Selected</h3>
                <p className="text-xs max-w-sm mx-auto leading-normal font-normal mb-6">
                  Please select a project from the Projects Directory tab or focus dropdown to construct a dynamic task board!
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                >
                  Enter Projects Directory
                </button>
              </div>
            )}

            {activeTab === 'logs' && !selectedProject && (
              <div className="bg-slate-900/20 rounded-2xl p-12 border border-slate-900 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                <History className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="font-bold text-white text-sm mb-1.5">No Active Revision Log Scope</h3>
                <p className="text-xs max-w-sm mx-auto leading-normal mb-6 font-normal">
                  Select a workflow project directory first to audit action triggers.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                >
                  Choose a Project
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
