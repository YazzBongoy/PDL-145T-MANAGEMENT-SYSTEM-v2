import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

// User payload from JWT token
export interface JWTPayload {
  userId: number;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include user
export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: JWTPayload;
}

// Common response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Project related types
export interface ProjectParams {
  id: string;
}

export interface ProjectCreateRequest {
  Name: string;
  StartDate: string;
  EndDate?: string;
  TotalBudget: number;
}

export interface ProjectUpdateRequest {
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  TotalBudget?: number;
}

// Task related types
export interface TaskParams {
  id: string;
  projectId?: string;
}

export interface TaskCreateRequest {
  Description: string;
  Duration?: number;
  AssignedTo?: string;
  CompletionStatus?: 'NotStarted' | 'InProgress' | 'Completed';
}

export interface TaskUpdateRequest {
  Description?: string;
  Duration?: number;
  AssignedTo?: string;
  CompletionStatus?: 'NotStarted' | 'InProgress' | 'Completed';
}

// Resource related types
export interface ResourceParams {
  id: string;
}

export interface ResourceCreateRequest {
  Type: string;
  Quantity: number;
}

export interface ResourceUpdateRequest {
  Type?: string;
  Quantity?: number;
}

// Expense related types
export interface ExpenseParams {
  id: string;
  taskId?: string;
}

export interface ExpenseCreateRequest {
  Description?: string;
  Cost: number;
  Date: string;
}

export interface ExpenseUpdateRequest {
  Description?: string;
  Cost?: number;
  Date?: string;
}

// Measurement related types
export interface MeasurementParams {
  id: string;
  taskId?: string;
}

export interface MeasurementCreateRequest {
  SiteID: string;
  MeasurementType: string;
  Value: number;
  Date: string;
}

export interface MeasurementUpdateRequest {
  SiteID?: string;
  MeasurementType?: string;
  Value?: number;
  Date?: string;
}

// Validation related types
export interface ValidationParams {
  id: string;
  taskId?: string;
}

export interface ValidationCreateRequest {
  SiteID: string;
  Status?: 'Pending' | 'Approved' | 'Rejected';
  Notes?: string;
  GeneratedBy: string;
}

export interface ValidationUpdateRequest {
  SiteID?: string;
  Status?: 'Pending' | 'Approved' | 'Rejected';
  Notes?: string;
  GeneratedBy?: string;
}

// Report related types
export interface ReportParams {
  id: string;
}

export interface ReportCreateRequest {
  ValidationID: number;
  ProjectID: number;
  GeneratedBy: string;
}

// ProjectResource related types
export interface ProjectResourceParams {
  projectId: string;
  resourceId: string;
}

export interface ProjectResourceCreateRequest {
  ProjectID: number;
  ResourceID: number;
}

// TaskResource related types
export interface TaskResourceParams {
  taskId: string;
  resourceId: string;
}

export interface TaskResourceCreateRequest {
  TaskID: number;
  ResourceID: number;
}

// Auth related types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN' | 'SUPERVISOR' | 'FINANCE' | 'CONSTRUCTION';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
