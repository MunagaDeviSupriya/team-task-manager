import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, UserWithPassword, Project, Task, ActivityLog } from './src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

interface DBStructure {
  users: UserWithPassword[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
}

const DEFAULT_USERS: UserWithPassword[] = [
  {
    id: 'u1',
    name: 'Alice Vance',
    email: 'alice@example.com',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    passwordHash: hashPassword('password123'),
  },
  {
    id: 'u2',
    name: 'Bob Carter',
    email: 'bob@example.com',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    passwordHash: hashPassword('password123'),
  },
  {
    id: 'u3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'Member',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    passwordHash: hashPassword('password123'),
  },
  {
    id: 'u4',
    name: 'David Mills',
    email: 'david@example.com',
    role: 'Member',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    passwordHash: hashPassword('password123'),
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Acme Web Redesign',
    description: 'Complete overhaul of the Acme Corp landing pages, customer portals, and CSS system using Tailwind v4 and React.',
    ownerId: 'u1',
    memberIds: ['u1', 'u2', 'u3', 'u4'],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p2',
    name: 'Mobile App MVP',
    description: 'Prototyping a light cross-platform task manager application for teams in the field.',
    ownerId: 'u2',
    memberIds: ['u1', 'u2', 'u4'],
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design responsive landing wires',
    description: 'Create Figma wires and responsive layout prototypes for the secondary checkout and dashboard pages.',
    assignedToId: 'u4',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Setup Express router & model routes',
    description: 'Configure clean API endpoints for authentication, project scopes, and task manipulation with express router.',
    assignedToId: 'u3',
    status: 'Completed',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0], // Overdue if not completed, but it is completed!
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Integrate custom CSS fonts & themes',
    description: 'Import Space Grotesk display fonts and configure the @theme variables inside index.css.',
    assignedToId: 'u3',
    status: 'To Do',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 't4',
    projectId: 'p2',
    title: 'Perform compliance regulatory audit',
    description: 'Run automated checks and prepare a CSV report outlining visual color-contrast accessibility compliance across all headers.',
    assignedToId: 'u1',
    status: 'To Do',
    priority: 'High',
    dueDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0], // Overdue!
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 't5',
    projectId: 'p2',
    title: 'Prototype animation loops with motion',
    description: 'Check Framer/Motion spring layouts and add drag feedback cards for task column transitions.',
    assignedToId: 'u4',
    status: 'In Review',
    priority: 'Low',
    dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    projectId: 'p1',
    userId: 'u1',
    userName: 'Alice Vance',
    action: 'initialized the Acme Web Redesign project',
    timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l2',
    projectId: 'p1',
    userId: 'u3',
    userName: 'Charlie Davis',
    action: 'marked "Setup Express router & model routes" as Completed',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l3',
    projectId: 'p2',
    userId: 'u2',
    userName: 'Bob Carter',
    action: 'created the Mobile App MVP project',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

// In-Memory Cache representing current DB state with thread-safe synchronous IO operations
class DBManager {
  private data: DBStructure;

  constructor() {
    this.ensureDirectory();
    this.data = this.readOrCreate();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private readOrCreate(): DBStructure {
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database file, rebuilding with defaults', err);
      }
    }

    const initialData: DBStructure = {
      users: DEFAULT_USERS,
      projects: DEFAULT_PROJECTS,
      tasks: DEFAULT_TASKS,
      activityLogs: DEFAULT_LOGS
    };
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave: DBStructure = this.data) {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  }

  // Users Helpers
  getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...rest }) => rest);
  }

  getUserWithPassword(email: string): UserWithPassword | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  updateUserRole(id: string, role: 'Admin' | 'Member'): User {
    const user = this.data.users.find(u => u.id === id);
    if (!user) {
      throw new Error(`User with ID "${id}" not found`);
    }
    user.role = role;
    this.save();
    const { passwordHash, ...rest } = user;
    return rest;
  }

  createUser(name: string, email: string, role: 'Admin' | 'Member', passwordPlain: string): User {
    const emailLower = email.toLowerCase();
    const existing = this.data.users.find(u => u.email.toLowerCase() === emailLower);
    if (existing) {
      throw new Error(`User with email "${email}" already exists`);
    }

    // Avatar search via clean initials generator SVG
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`;

    const newUser: UserWithPassword = {
      id: 'u' + (this.data.users.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      name,
      email: emailLower,
      role,
      avatarUrl,
      passwordHash: hashPassword(passwordPlain)
    };

    this.data.users.push(newUser);
    this.save();

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  // Projects Helpers
  getProjects(): Project[] {
    return this.data.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  createProject(name: string, description: string, ownerId: string, memberIds: string[]): Project {
    const newProject: Project = {
      id: 'p' + (this.data.projects.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      name,
      description,
      ownerId,
      memberIds: Array.from(new Set([ownerId, ...memberIds])),
      createdAt: new Date().toISOString()
    };

    this.data.projects.push(newProject);
    this.save();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'memberIds' | 'ownerId'>>): Project {
    const projectIndex = this.data.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    const current = this.data.projects[projectIndex];
    const updated = {
      ...current,
      ...updates
    };

    this.data.projects[projectIndex] = updated as Project;
    this.save();
    return updated as Project;
  }

  deleteProject(id: string): boolean {
    const lenBefore = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    // Cascade delete project tasks and logs
    this.data.tasks = this.data.tasks.filter(t => t.projectId !== id);
    this.data.activityLogs = this.data.activityLogs.filter(l => l.projectId !== id);
    this.save();
    return this.data.projects.length < lenBefore;
  }

  // Tasks Helpers
  getTasks(): Task[] {
    return this.data.tasks;
  }

  getTasksByProject(projectId: string): Task[] {
    return this.data.tasks.filter(t => t.projectId === projectId);
  }

  getTaskById(id: string): Task | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  createTask(projectId: string, title: string, description: string, assignedToId: string, priority: 'Low' | 'Medium' | 'High', dueDate: string): Task {
    const newTask: Task = {
      id: 't' + (this.data.tasks.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      projectId,
      title,
      description,
      assignedToId,
      status: 'To Do',
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'assignedToId' | 'status' | 'priority' | 'dueDate'>>): Task {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" not found`);
    }

    const current = this.data.tasks[index];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.tasks[index] = updated;
    this.save();
    return updated;
  }

  deleteTask(id: string): boolean {
    const lenBefore = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
    return this.data.tasks.length < lenBefore;
  }

  // Logs Helpers
  getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  getLogsByProject(projectId: string): ActivityLog[] {
    return this.data.activityLogs.filter(l => l.projectId === projectId);
  }

  addActivityLog(projectId: string, userId: string, userName: string, action: string): ActivityLog {
    const newLog: ActivityLog = {
      id: 'l' + (this.data.activityLogs.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      projectId,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString()
    };

    this.data.activityLogs.unshift(newLog); // Push to top/start of array for chronologically descending logs
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 200); // Caps database size
    }
    this.save();
    return newLog;
  }
}

export const db = new DBManager();
