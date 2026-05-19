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
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked'
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
  Description: string | null;
  Duration?: number | null;
  AssignedTo?: string | null;
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

// Phase 2: Enterprise Types
export const EnterpriseType = {
  SPRL: 'SPRL',
  SARL: 'SARL',
  SA: 'SA',
  SNC: 'SNC',
  SCS: 'SCS',
  ONG: 'ONG',
  AUTRES: 'AUTRES'
} as const;
export type EnterpriseType = typeof EnterpriseType[keyof typeof EnterpriseType];

export const EnterpriseRole = {
  CHEF_FILE: 'CHEF_FILE',
  MEMBRE_GROUPEMENT: 'MEMBRE_GROUPEMENT',
  CFEF_CONTRACTANT: 'CFEF_CONTRACTANT',
  SOUS_TRAITANT: 'SOUS_TRAITANT'
} as const;
export type EnterpriseRole = typeof EnterpriseRole[keyof typeof EnterpriseRole];

export interface Enterprise {
  EnterpriseID: number;
  Name: string;
  Type: EnterpriseType;
  Role: EnterpriseRole;
  ContactEmail?: string;
  ContactPhone?: string;
  Address?: string;
  TaxID?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ProjectEnterprise {
  ProjectID: number;
  EnterpriseID: number;
  Role: EnterpriseRole;
  JoinedAt: string;
  Enterprise: Enterprise;
}

// Phase 2: Contract Types
export const ContractStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED'
} as const;
export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface Contract {
  ContractID: number;
  ContractNumber: string;
  ProjectID: number;
  EnterpriseID: number;
  Title: string;
  TotalAmount: number;
  StartDate: string;
  EndDate?: string;
  Status: ContractStatus;
  AdvancePayment?: number;
  RetentionRate?: number;
  PenaltyRate?: number;
  Description?: string;
  CreatedAt: string;
  UpdatedAt: string;
  Enterprise?: Enterprise;
  Project?: Project;
  PaymentSchedules?: PaymentSchedule[];
  Documents?: Document[];
}

export interface PaymentSchedule {
  ScheduleID: number;
  ContractID: number;
  Description?: string;
  Amount: number;
  DueDate: string;
  PaidAmount?: number;
  PaidDate?: string;
  Status: PaymentStatus;
  CreatedAt: string;
}

// Phase 2: Document Types
export const DocumentType = {
  PLAN: 'PLAN',
  CONTRAT: 'CONTRAT',
  PV_RECEPTION: 'PV_RECEPTION',
  RAPPORT_AVANCEMENT: 'RAPPORT_AVANCEMENT',
  FACTURE: 'FACTURE',
  DECOMPTE: 'DECOMPTE',
  GARANTIE: 'GARANTIE',
  AUTRE: 'AUTRE'
} as const;
export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface Document {
  DocumentID: number;
  ContractID?: number;
  ProjectID?: number;
  Name: string;
  Type: DocumentType;
  URL: string;
  Version: number;
  Size?: number;
  MimeType?: string;
  UploadedBy: number;
  UploadedAt: string;
  UpdatedAt: string;
}

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  APPROVAL_GRANTED: 'APPROVAL_GRANTED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  SYSTEM: 'SYSTEM'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface ManagedUser extends User {
  status: UserStatus;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  module: string;
  action: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPermission {
  userId: number;
  permissionId: number;
  grantedBy?: number;
  grantedAt: string;
  revokedAt?: string;
  permission?: Permission;
  user?: Pick<ManagedUser, 'id' | 'name' | 'email'>;
}

export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  module: string;
  config: Record<string, unknown>;
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
}
