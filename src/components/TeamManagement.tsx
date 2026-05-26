import React, { useState } from 'react';
import { User, Role } from '../types';
import { ShieldAlert, Users, Shield, UserCog, UserCheck, AlertCircle } from 'lucide-react';

interface TeamManagementProps {
  users: User[];
  currentUser: User;
  onUpdateUserRole: (id: string, role: Role) => Promise<void>;
}

export default function TeamManagement({ users, currentUser, onUpdateUserRole }: TeamManagementProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'Admin';

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (userId === currentUser.id) {
      alert("Demoting yourself is forbidden to guarantee access safety keys!");
      return;
    }

    setUpdatingId(userId);
    try {
      await onUpdateUserRole(userId, newRole);
    } catch (err: any) {
      alert(err.message || 'Failed to update colleague role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Team Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Workspace Colleagues & Access Controls
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect directories, and adjust system permissions for team members
        </p>
      </div>

      {/* Notice Banner */}
      <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-800/80 flex gap-3 text-xs text-slate-400 leading-normal">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200 block mb-0.5">Role Guidelines (Admin vs Member)</span>
          Admins hold full create/delete authority for projects and task scopes. Members can join project boards and update task columns specifically assigned to their names.
        </div>
      </div>

      {/* Users list/table */}
      <div className="bg-slate-900/10 border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] font-bold font-mono tracking-wider uppercase">
              <tr>
                <th className="py-4.5 px-5">Team Colleague</th>
                <th className="py-4.5 px-4">Email Address</th>
                <th className="py-4.5 px-4">Target Role</th>
                <th className="py-4.5 px-5 text-right font-mono">Authorization Keys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => {
                const isSelf = u.id === currentUser.id;
                const canEditRole = isAdmin && !isSelf;

                return (
                  <tr key={u.id} className="hover:bg-slate-900/10 transition-all">
                    
                    {/* User Profile */}
                    <td className="py-4.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-slate-850 object-cover"
                        />
                        <div>
                          <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 rounded-md">
                                YOU
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">User ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email address */}
                    <td className="py-4.5 px-4 whitespace-nowrap text-slate-400">
                      {u.email}
                    </td>

                    {/* User Role */}
                    <td className="py-4.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {u.role === 'Admin' ? <ShieldAlert className="w-3.5 h-3.5" /> : <UserCog className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Role Adjustment tools */}
                    <td className="py-4.5 px-5 text-right whitespace-nowrap">
                      {canEditRole ? (
                        <div className="inline-flex items-center justify-end">
                          <select
                            disabled={updatingId === u.id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl py-1.5 px-3 text-[10px] text-slate-200 focus:outline-none cursor-pointer transition-all font-semibold"
                          >
                            <option value="Member">Demote to Member</option>
                            <option value="Admin">Promote to Admin</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic pr-2 font-normal select-none">
                          {isSelf ? 'Self Preserved' : 'Admin Restricted'}
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
