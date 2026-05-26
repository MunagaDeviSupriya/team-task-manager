import { User, Project, Task, ActivityLog, AuthResponse } from './types';

const API_BASE = '/api';

class APIClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let message = 'An unexpected error occurred';
      let textBody = '';
      try {
        textBody = await res.text();
        const errorData = JSON.parse(textBody);
        message = errorData.error || message;
      } catch (e) {
        // Response is not JSON
        message = `Server error ${res.status}: ${textBody.slice(0, 300) || res.statusText}`;
      }
      throw new Error(message);
    }
    
    // Some endpoints may return JSON or empty bodies
    try {
      return await res.json() as T;
    } catch (e) {
      return {} as T;
    }
  }

  // AUTH
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const authData = await this.handleResponse<AuthResponse>(res);
    localStorage.setItem('token', authData.token);
    return authData;
  }

  async register(name: string, email: string, password: string, role: 'Admin' | 'Member'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    // Support custom registration status code 211
    if (res.status === 211) {
      const authData = await res.json() as AuthResponse;
      localStorage.setItem('token', authData.token);
      return authData;
    }
    return this.handleResponse<AuthResponse>(res);
  }

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // USERS
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User[]>(res);
  }

  async updateUserRole(id: string, role: 'Admin' | 'Member'): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse<{ user: User }>(res);
  }

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Project[]>(res);
  }

  async createProject(name: string, description: string, memberIds: string[]): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, description, memberIds }),
    });
    return this.handleResponse<Project>(res);
  }

  async updateProject(id: string, name: string, description: string, memberIds: string[]): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, description, memberIds }),
    });
    return this.handleResponse<Project>(res);
  }

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(res);
  }

  // TASKS
  async getTasks(projectId: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Task[]>(res);
  }

  async createTask(
    projectId: string,
    title: string,
    description: string,
    assignedToId: string,
    priority: 'Low' | 'Medium' | 'High',
    dueDate: string
  ): Promise<Task> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description, assignedToId, priority, dueDate }),
    });
    return this.handleResponse<Task>(res);
  }

  async updateTask(
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'assignedToId' | 'status' | 'priority' | 'dueDate'>>
  ): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Task>(res);
  }

  async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(res);
  }

  // LOGS
  async getLogs(projectId: string): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/logs`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ActivityLog[]>(res);
  }
}

export const api = new APIClient();
