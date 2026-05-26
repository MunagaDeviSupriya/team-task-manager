import React, { useState } from 'react';
import { Project, User } from '../types';
import { Briefcase, Plus, FolderSync, Trash2, Pencil, Users, Check, AlertCircle } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  users: User[];
  currentUser: User;
  onProjectSelect: (project: Project) => void;
  selectedProject: Project | null;
  onCreateProject: (name: string, description: string, memberIds: string[]) => Promise<void>;
  onUpdateProject: (id: string, name: string, description: string, memberIds: string[]) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export default function ProjectList({
  projects,
  users,
  currentUser,
  onProjectSelect,
  selectedProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: ProjectListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const handleOpenCreateForm = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setSelectedMembers([currentUser.id]); // Automatically include self
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the project
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description);
    setSelectedMembers(proj.memberIds);
    setError(null);
    setIsFormOpen(true);
  };

  const handleToggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      // Keep at least the owner if updating
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Project name is required');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      if (editingProject) {
        await onUpdateProject(editingProject.id, name, description, selectedMembers);
      } else {
        await onCreateProject(name, description, selectedMembers);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the project "${proj.name}"? This cascades to delete its associated tasks and logs.`)) {
      try {
        await onDeleteProject(proj.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* List Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Projects Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {projects.length} workspace projects available to your role
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Form Area */}
      {isFormOpen && (
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-indigo-400" />
              {editingProject ? `Edit Project: ${editingProject.name}` : 'Instantiate New Team Scope'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name & desc */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website Redesign v2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe project objectives and scope parameters..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Members Selection checkboxes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Assign Team Members ({selectedMembers.length} selected)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-56 overflow-y-auto p-2 space-y-1">
                  {users.map(u => {
                    const isSelected = selectedMembers.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => handleToggleMember(u.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all text-xs border ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-300' 
                            : 'hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} 
                            alt={u.name} 
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-semibold block">{u.name}</span>
                            <span className="text-[10px] text-slate-500">{u.role} • {u.email}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800/80">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                {submitting ? 'Saving changes...' : editingProject ? 'Apply Changes' : 'Launch Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Projects List */}
      {projects.length === 0 ? (
        <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
          <Briefcase className="w-8 h-8 mx-auto text-slate-600 mb-2.5" />
          <p className="text-xs">You aren't associated with any projects yet.</p>
          {isAdmin && (
            <p className="text-[11px] text-slate-500 mt-1">Tap standard "New Project" actions above to launch terms.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(proj => {
            const isSelected = selectedProject?.id === proj.id;
            const projectMembers = users.filter(u => proj.memberIds.includes(u.id));

            return (
              <div
                key={proj.id}
                onClick={() => onProjectSelect(proj)}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer hover:border-slate-700/80 ${
                  isSelected 
                    ? 'bg-indigo-950/20 border-indigo-500/60 shadow-[0_4px_15px_rgba(99,102,241,0.05)]' 
                    : 'bg-slate-900/10 border-slate-800/60'
                }`}
              >
                <div>
                  {/* Title Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{proj.name}</h3>
                    
                    {/* Action buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleOpenEditForm(proj, e)}
                          title="Edit Details"
                          className="p-1 px-1.5 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer border border-slate-800/40"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(proj, e)}
                          title="Delete Project"
                          className="p-1 px-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer border border-slate-800/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mt-2 font-normal leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Team Avatars Footer info */}
                <div className="border-t border-slate-800/80 mt-5 pt-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>{proj.memberIds.length} Team Members</span>
                  </div>
                  
                  {/* Circular Avatars */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {projectMembers.slice(0, 4).map(m => (
                      <img
                        key={m.id}
                        src={m.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                        title={`${m.name} (${m.role})`}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="inline-block h-5 w-5 rounded-full ring-1.5 ring-slate-900 object-cover"
                      />
                    ))}
                    {projectMembers.length > 4 && (
                      <span className="flex items-center justify-center bg-slate-950 font-mono text-[8px] font-bold text-slate-400 w-5 h-5 rounded-full ring-1.5 ring-slate-900 select-none">
                        +{projectMembers.length - 4}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
