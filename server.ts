import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server-db';
import { Role } from './src/types';

// Extend Request interface to support authenticated user payload
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'team-task-manager-super-secret-key-987654';

// Secure custom Token Helpers
function generateToken(user: { id: string; role: Role; email: string }): string {
  const payload = `${user.id}|${user.role}|${user.email}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}||${signature}`).toString('base64');
}

function verifyToken(token: string): { id: string; role: Role; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split('||');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;

    const [id, role, email] = payload.split('|');
    return { id, role: role as Role, email };
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token is required' });
    return;
  }

  const userPayload = verifyToken(token);
  if (!userPayload) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
    return;
  }

  req.user = userPayload;
  next();
}

// Authorization Middlewares
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'Admin') {
    res.status(403).json({ error: 'Admin role is required to perform this action' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Log Requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // --- API ROUTES ---

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Auth - Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const matchedUser = db.getUserWithPassword(email);
    if (!matchedUser) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const enteredHash = crypto.createHash('sha256').update(password).digest('hex');
    if (matchedUser.passwordHash !== enteredHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { passwordHash, ...safeUser } = matchedUser;
    const token = generateToken(safeUser);

    res.json({
      token,
      user: safeUser
    });
  });

  // Auth - Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    try {
      const assignedRole = role === 'Admin' ? 'Admin' : 'Member';
      const newUser = db.createUser(name, email, assignedRole, password);
      const token = generateToken(newUser);

      res.status(211).json({
        token,
        user: newUser
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  // Auth - Me (current user session)
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'User info not found' });
      return;
    }
    const fullUser = db.getUserById(req.user.id);
    if (!fullUser) {
      res.status(404).json({ error: 'User does not exist in the database' });
      return;
    }
    res.json(fullUser);
  });

  // Users - List all users (for project assignments / task selection)
  app.get('/api/users', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json(db.getUsers());
  });

  // Users - Update user role (Admin only)
  app.put('/api/users/:id/role', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { role } = req.body;
    if (role !== 'Admin' && role !== 'Member') {
      res.status(400).json({ error: 'Invalid role assignment' });
      return;
    }

    const { id } = req.params;
    // We cannot change our own role to preserve at least one admin
    if (req.user?.id === id) {
      res.status(400).json({ error: 'You are not allowed to change your own role' });
      return;
    }

    try {
      const updatedUser = db.updateUserRole(id, role);
      res.json({ message: 'User role updated successfully', user: updatedUser });
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'User not found' });
    }
  });

  // --- PROJECTS ENDPOINTS ---

  // List all projects (Admins view all; Members view projects they are a member of)
  app.get('/api/projects', authenticateToken, (req: AuthRequest, res: Response) => {
    const allProjects = db.getProjects();
    if (req.user?.role === 'Admin') {
      res.json(allProjects);
    } else {
      const memberProjects = allProjects.filter(p => p.memberIds.includes(req.user!.id));
      res.json(memberProjects);
    }
  });

  // Create Project (Admin Only)
  app.post('/api/projects', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { name, description, memberIds } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    try {
      const creatorId = req.user!.id;
      const cleanMemberIds = Array.isArray(memberIds) ? memberIds : [];
      const newProj = db.createProject(name, description || '', creatorId, cleanMemberIds);

      // Create log
      db.addActivityLog(newProj.id, creatorId, req.user!.email, `created project "${name}"`);

      res.status(211).json(newProj);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update Project (Admin Only)
  app.put('/api/projects/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description, memberIds } = req.body;

    try {
      const proj = db.getProjectById(id);
      if (!proj) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (memberIds !== undefined) updates.memberIds = memberIds;

      const updatedProj = db.updateProject(id, updates);

      // Create activity log
      db.addActivityLog(id, req.user!.id, req.user!.email, `updated project details`);

      res.json(updatedProj);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete Project (Admin Only)
  app.delete('/api/projects/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const proj = db.getProjectById(id);
      if (!proj) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      db.deleteProject(id);
      res.json({ success: true, message: `Project "${proj.name}" and associated tasks deleted` });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- TASKS ENDPOINTS ---

  // Get project tasks (Admins get all; Members can get if they are a member of the project)
  app.get('/api/projects/:projectId/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const proj = db.getProjectById(projectId);

    if (!proj) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Role verification
    if (req.user?.role !== 'Admin' && !proj.memberIds.includes(req.user!.id)) {
      res.status(403).json({ error: 'You are not a member of this project' });
      return;
    }

    const tasks = db.getTasksByProject(projectId);
    res.json(tasks);
  });

  // Create Task (Admin Only)
  app.post('/api/projects/:projectId/tasks', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { title, description, assignedToId, priority, dueDate } = req.body;

    if (!title || !assignedToId || !priority || !dueDate) {
      res.status(400).json({ error: 'Title, assigned employee, priority, and due date are required' });
      return;
    }

    const proj = db.getProjectById(projectId);
    if (!proj) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if assignee exists and is on dynamic team
    const assignee = db.getUserById(assignedToId);
    if (!assignee) {
      res.status(400).json({ error: 'Assigned user does not exist' });
      return;
    }

    try {
      const task = db.createTask(
        projectId,
        title,
        description || '',
        assignedToId,
        priority,
        dueDate
      );

      // Create activity log
      db.addActivityLog(projectId, req.user!.id, req.user!.email, `added task "${title}"`);

      res.status(211).json(task);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update Task:
  // - Admin can update ANY fields.
  // - Member can ONLY update "status" of tasks assigned to them.
  app.put('/api/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, assignedToId, status, priority, dueDate } = req.body;

    const task = db.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const isUserAdmin = req.user!.role === 'Admin';
    const isUserAssignee = task.assignedToId === req.user!.id;

    if (!isUserAdmin && !isUserAssignee) {
      res.status(403).json({ error: 'Access denied: You can only update tasks assigned to you' });
      return;
    }

    try {
      let updates: any = {};

      if (isUserAdmin) {
        // Admin gets absolute permission
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (assignedToId !== undefined) {
          const assignee = db.getUserById(assignedToId);
          if (!assignee) {
            res.status(400).json({ error: 'Assigned user not found' });
            return;
          }
          updates.assignedToId = assignedToId;
        }
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = dueDate;
      } else {
        // Member can only mutate "status"
        if (title !== undefined || description !== undefined || assignedToId !== undefined || priority !== undefined || dueDate !== undefined) {
          res.status(403).json({ error: 'Members are only authorized to update task status' });
          return;
        }
        if (status !== undefined) {
          updates.status = status;
        } else {
          res.status(400).json({ error: 'Status update is required for member task operations' });
          return;
        }
      }

      const updatedTask = db.updateTask(id, updates);

      // Log status transitions or general modifications
      const detail = status ? `changed status of "${task.title}" to "${status}"` : `edited task "${task.title}"`;
      db.addActivityLog(task.projectId, req.user!.id, req.user!.email, detail);

      res.json(updatedTask);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete Task (Admin Only)
  app.delete('/api/tasks/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const task = db.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    try {
      db.deleteTask(id);
      db.addActivityLog(task.projectId, req.user!.id, req.user!.email, `removed task "${task.title}"`);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Task deletion failed' });
    }
  });

  // --- ACTIVITY LOGS ENDPOINT ---
  app.get('/api/projects/:projectId/logs', authenticateToken, (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const proj = db.getProjectById(projectId);

    if (!proj) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (req.user?.role !== 'Admin' && !proj.memberIds.includes(req.user!.id)) {
      res.status(403).json({ error: 'Access denied: You are not a member of this project' });
      return;
    }

    res.json(db.getLogsByProject(projectId));
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Team Task Manager full-stack backend active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Server failed to initiate:', err);
});
