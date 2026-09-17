export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: { url: string; localPath: string };
  isEmailVerified: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string | User;
  members?: number;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  project: string | Project;
  user: string | User;
  role: 'admin' | 'project_admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string | Project;
  assignedTo?: string | User;
  assignedBy?: string | User;
  status: TaskStatus;
  attachments: Attachment[];
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  _id: string;
  title: string;
  task: string | Task;
  isCompleted: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  mimetype: string;
  size: number;
}

export interface Note {
  _id: string;
  project: string | Project;
  createdBy: string | User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}