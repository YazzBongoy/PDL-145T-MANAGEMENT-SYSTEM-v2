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
  [key: string]: unknown;
}

export interface ExpenseForm {
  Description: string;
  Cost: string;
  Date: string;
  [key: string]: unknown;
}

export const DocumentCategory = {
  JURIDIQUE: 'JURIDIQUE',
  FINANCE: 'FINANCE',
  SUIVI: 'SUIVI',
  TECHNIQUE: 'TECHNIQUE',
  ADMIN: 'ADMIN'
} as const;

export type DocumentCategory = typeof DocumentCategory[keyof typeof DocumentCategory];

export interface DocumentItem {
  DocumentID: number;
  FileName: string;
  Title: string;
  Category: DocumentCategory;
  OntologyClass: string;
  DocumentDate?: string | null;
  FilePath: string;
  Lot?: string | null;
  Phase?: string | null;
  ProjectID?: number | null;
  TerritoryID?: number | null;
  SiteID?: string | null;
  MontantUSD?: number | null;
  Notes?: string | null;
  Project?: { ProjectID: number; Name: string } | null;
  Territory?: { TerritoryID: number; Name: string } | null;
  Site?: { SiteID: string; Name: string; Type: string } | null;
}

export interface DocumentFilters {
  category: string;
  lot: string;
  territoire: string;
  siteId: string;
  phase: string;
  q: string;
}

export interface DocumentStats {
  total: number;
  byCategory: Record<string, number>;
  byPhase: Record<string, number>;
  byTerritory: Record<string, number>;
}

export interface DocumentsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedDocuments {
  data: DocumentItem[];
  pagination: DocumentsPagination;
}

export interface Measurement {
  MeasurementID: number;
  TaskID: number;
  SiteID: string;
  MeasurementType: string;
  Value: number;
  Date: string;
  CreatedAt: string;
  Site?: { SiteID: string; Name: string };
  Task?: { TaskID: number; Description: string };
}

export interface MeasurementForm {
  TaskID: string;
  SiteID: string;
  MeasurementType: string;
  Value: string;
  Date: string;
  [key: string]: unknown;
}

export const ValidationStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type ValidationStatusType = typeof ValidationStatus[keyof typeof ValidationStatus];

export interface Validation {
  ValidationID: number;
  TaskID: number;
  SiteID: string;
  Status: ValidationStatusType;
  Notes?: string | null;
  GeneratedBy: string;
  Timestamp: string;
  UpdatedAt: string;
  Site?: { SiteID: string; Name: string };
  Task?: { TaskID: number; Description: string };
}

export interface ValidationForm {
  TaskID: string;
  SiteID: string;
  Notes: string;
  GeneratedBy: string;
  [key: string]: unknown;
}

export interface Report {
  ReportID: number;
  ValidationID: number;
  ProjectID: number;
  GeneratedBy: string;
  Timestamp: string;
  UpdatedAt: string;
  Validation?: { ValidationID: number; Status: string };
  Project?: { ProjectID: number; Name: string };
}

export interface ReportForm {
  ValidationID: string;
  ProjectID: string;
  GeneratedBy: string;
  [key: string]: unknown;
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
}

// Dashboard Stats Types
export interface DashboardStats {
  projects: {
    total: number;
    recent: Array<{
      ProjectID: number;
      Name: string;
      StartDate: string;
      EndDate?: string | null;
      TotalBudget: number;
      _count: { Tasks: number };
    }>;
  };
  tasks: {
    total: number;
    byStatus: {
      NotStarted: number;
      InProgress: number;
      Completed: number;
    };
    completionRate: number;
  };
  budget: {
    totalBudget: number;
    totalExpenses: number;
    utilization: number;
  };
  expenses: {
    total: number;
    totalCost: number;
  };
  resources: {
    total: number;
  };
  documents: {
    total: number;
    byCategory: Record<string, number>;
  };
  sites: {
    total: number;
    territories: number;
  };
  measurements: {
    total: number;
    recent: Array<{
      MeasurementID: number;
      MeasurementType: string;
      Value: number;
      Date: string;
      SiteID: string;
      Site: { Name: string };
    }>;
  };
  validations: {
    total: number;
    byStatus: {
      Pending: number;
      Approved: number;
      Rejected: number;
    };
    recent: Array<{
      ValidationID: number;
      Status: string;
      GeneratedBy: string;
      Timestamp: string;
      SiteID: string;
      Site: { Name: string };
    }>;
  };
}
