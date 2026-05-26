export type Role = 'Admin' | 'Member';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface UserWithPassword extends User {
  passwordHash: string; // Simplistic hashed/stored password for this full-stack app
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[]; // IDs of users who are members of this project
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToId: string; // User ID
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO String (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string; // e.g., "moved task to In Progress"
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalTasks: number;
  statusCounters: Record<TaskStatus, number>;
  priorityCounters: Record<TaskPriority, number>;
  completedTasks: number;
  overdueTasks: number;
}
