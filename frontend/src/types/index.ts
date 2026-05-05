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

export const OuvrageType = {
  ECOLE: 'ECOLE',
  CENTRE_SANTE: 'CENTRE_SANTE',
  BATIMENT_ADMINISTRATIF: 'BATIMENT_ADMINISTRATIF'
} as const;

export type OuvrageType = typeof OuvrageType[keyof typeof OuvrageType];

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
  Name: string;
  Description: string;
  Duration?: number;
  AssignedTo?: string;
  CompletionStatus: TaskStatus;
  ouvrageType?: OuvrageType;
  progressPercentage?: number;
  SubTasks?: Task[];
}

export interface Resource {
  ResourceID: number;
  Name: string;
  Type: 'EQUIPEMENT' | 'MATERIEL' | 'HUMAIN' | string;
  Quantity: number;
  Description?: string;
  Status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | string;
  Cost?: number;
  Location?: string;
  SerialNumber?: string;
  PurchaseDate?: string;
  LastMaintenance?: string;
  NextMaintenance?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
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
  Name: string;
  Type: 'EQUIPEMENT' | 'MATERIEL' | 'HUMAIN' | string;
  Quantity: string;
  Description?: string;
  Status?: string;
  Cost?: string;
  Location?: string;
  SerialNumber?: string;
  // Pour ressources humaines - Homme-jour (temps d'exécution)
  WorkDays?: string;  // Nombre de jours de travail (Homme-jour)
}

export interface ExpenseForm {
  Description: string;
  Cost: string;
  Date: string;
}

export interface Sprint {
  SprintID: number;
  ProjectID: number;
  Name: string;
  StartDate: string;
  EndDate: string;
  Status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Measurement {
  MeasurementID?: number;
  TaskID: number;
  SiteID: string;
  MeasurementType: 'Distance' | 'Area' | 'Volume' | 'Weight' | 'Time' | string;
  Value: number;
  Unit: string;
  Notes?: string;
  Date?: string;
  MeasuredBy?: number;
}

export interface Validation {
  ValidationID?: number;
  TaskID: number;
  ExpenseID?: number;
  Status: 'PENDING' | 'APPROVED' | 'REJECTED';
  RL_Approval?: boolean;
  RC_Approval?: boolean;
  CQ_Approval?: boolean;
  CFEF_Approval?: boolean;
  Notes?: string;
  SubmittedBy?: number;
  SubmittedAt?: string;
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

export type ConstructionStepType =
  | 'INSTALLATION_CHANTIER'
  | 'FOUILLES'
  | 'MACONNERIE_FONDATION'
  | 'SOCLES_COLONNES'
  | 'REMBLAIS'
  | 'SOUS_PAVEMENT'
  | 'STRUCTURE_CHARPENTE'
  | 'TOITURE'
  | 'INSTALLATION_ELECTRIQUE'
  | 'INSTALLATION_SANITAIRE'
  | 'MENUISERIES'
  | 'FINITIONS_INTERIEURES'
  | 'FINITIONS_EXTERIEURES'
  | 'AMENAGEMENT_ACCES'
  | 'CLOTURES'
  | 'RECEPTION';

export type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface ConstructionStep {
  StepID: number;
  TaskID: number;
  StepType: ConstructionStepType;
  Name: string;
  Description?: string;
  Order: number;
  ProgressPercent: number;
  Status: StepStatus;
  StartDate?: string;
  EndDate?: string;
  ActualCost?: number;
  EstimatedCost?: number;
  Photos?: ConstructionPhoto[];
}

export interface ConstructionPhoto {
  PhotoID: number;
  StepID: number;
  URL: string;
  Caption?: string;
  TakenAt: string;
  TakenBy?: string;
  Latitude?: number;
  Longitude?: number;
}

export interface Device {
  ResourceID: number;
  Name: string;
  Type: string;
  Description?: string;
  Quantity: number;
  Status: 'active' | 'inactive' | 'maintenance';
  Location?: string;
  SerialNumber?: string;
  PurchaseDate?: string;
  LastMaintenance?: string;
  NextMaintenance?: string;
  Cost?: number;
  CreatedAt: string;
  UpdatedAt: string;
}
