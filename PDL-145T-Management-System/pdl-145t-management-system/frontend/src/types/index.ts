export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  FINANCE: 'FINANCE',
  CONSTRUCTION: 'CONSTRUCTION',
  USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const TaskStatus = {
  NOT_STARTED: 'NotStarted',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Project {
  ProjectID: number;
  Name: string;
  StartDate: string;
  EndDate?: string;
  TotalBudget: number;
}

export interface Task {
  TaskID: number;
  ProjectID: number;
  Description: string;
  Duration?: number;
  AssignedTo?: string;
  CompletionStatus: TaskStatus;
}

export interface Resource {
  ResourceID: number;
  Type: string;
  Quantity: number;
}

export interface Expense {
  ExpenseID: number;
  TaskID: number;
  Description?: string;
  Cost: number;
  Date: string;
}

export interface ProjectForm {
  Name: string;
  StartDate: string;
  EndDate: string;
  TotalBudget: string;
}

export interface TaskForm {
  Description: string;
  Duration: string;
  AssignedTo: string;
  CompletionStatus: TaskStatus;
}

export interface ResourceForm {
  Type: string;
  Quantity: string;
}

export interface ExpenseForm {
  Description: string;
  Cost: string;
  Date: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
