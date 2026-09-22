# PDL-145T API Documentation

**Base URL:** `http://localhost:3010/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`.

---

## Auth Endpoints

### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" },
  "token": "jwt-token..."
}
```

### POST /api/auth/login

Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt-token...",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" }
}
```

---

## Project Endpoints

### GET /api/projects

List all projects.

**Response (200):**
```json
[
  {
    "ProjectID": 1,
    "Name": "PDL-145T Phase 1",
    "StartDate": "2024-01-01T00:00:00.000Z",
    "EndDate": "2024-12-31T00:00:00.000Z",
    "TotalBudget": 100000,
    "CreatedAt": "...",
    "UpdatedAt": "..."
  }
]
```

### POST /api/projects

Create a new project. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "Name": "New Project",
  "StartDate": "2024-01-01T00:00:00.000Z",
  "EndDate": "2024-12-31T00:00:00.000Z",
  "TotalBudget": 50000
}
```

### GET /api/projects/:id

Get project details.

### PUT /api/projects/:id

Update a project. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/projects/:id

Delete a project. **Requires ADMIN or SUPERVISOR role.**

---

## Task Endpoints

### GET /api/tasks/project/:projectId

List tasks for a project.

### POST /api/tasks/project/:projectId

Create a task for a project. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "Description": "Build foundation",
  "Duration": 30,
  "AssignedTo": "John Doe",
  "CompletionStatus": "NotStarted"
}
```

### PUT /api/tasks/:id

Update a task. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/tasks/:id

Delete a task. **Requires ADMIN or SUPERVISOR role.**

---

## Expense Endpoints

### GET /api/expenses/task/:taskId

List expenses for a task.

### POST /api/expenses

Create an expense. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "TaskID": 1,
  "Description": "Cement purchase",
  "Cost": 500,
  "Date": "2024-06-15T00:00:00.000Z"
}
```

### PUT /api/expenses/:id

Update an expense. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/expenses/:id

Delete an expense. **Requires ADMIN or SUPERVISOR role.**

---

## Resource Endpoints

### GET /api/resources

List all resources.

### POST /api/resources

Create a resource. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "Type": "Cement",
  "Quantity": 100
}
```

### PUT /api/resources/:id

Update a resource. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/resources/:id

Delete a resource. **Requires ADMIN or SUPERVISOR role.**

---

## Resource Assignment Endpoints

### GET /api/assignments/project/:projectId

List resources assigned to a project.

### POST /api/assignments/project/:projectId

Assign a resource to a project. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "ResourceID": 1
}
```

### DELETE /api/assignments/project/:projectId/resource/:resourceId

Unassign a resource from a project.

### GET /api/assignments/task/:taskId

List resources assigned to a task.

### POST /api/assignments/task/:taskId

Assign a resource to a task. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/assignments/task/:taskId/resource/:resourceId

Unassign a resource from a task.

---

## Measurement Endpoints

### GET /api/measurements

List measurements (paginated).

**Query params:** `page`, `limit`, `sortBy`, `sortOrder`

### GET /api/measurements/task/:taskId

List measurements for a task.

### POST /api/measurements/task/:taskId

Create a measurement. **Requires CONSTRUCTION role.**

**Request:**
```json
{
  "SiteID": "SITE-001",
  "MeasurementType": "Concrete Pour",
  "Value": 25.5,
  "Date": "2024-06-15T00:00:00.000Z"
}
```

### PUT /api/measurements/:id

Update a measurement. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/measurements/:id

Delete a measurement. **Requires ADMIN or SUPERVISOR role.**

---

## Validation Endpoints

### GET /api/validations

List validations (paginated).

### GET /api/validations/task/:taskId

List validations for a task.

### POST /api/validations/task/:taskId

Create a validation. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "SiteID": "SITE-001",
  "Notes": "Foundation inspection passed",
  "GeneratedBy": "Inspector Name"
}
```

### PUT /api/validations/:id

Update a validation. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/validations/:id

Delete a validation. **Requires ADMIN or SUPERVISOR role.**

### POST /api/validations/:id/approve

Approve a validation. **Requires FINANCE role.**

### POST /api/validations/:id/reject

Reject a validation. **Requires FINANCE role.**

---

## Document Endpoints

### GET /api/documents

List documents with pagination and filters.

**Query params:** `page`, `limit`, `category`, `lot`, `territoire`, `siteId`, `phase`, `q`, `sortBy`, `sortOrder`

### GET /api/documents/stats

Get document statistics (by category, phase, territory).

### POST /api/documents

Create a document. **Requires ADMIN or SUPERVISOR role.**

**Request:**
```json
{
  "FileName": "contract.pdf",
  "Title": "Construction Contract",
  "Category": "JURIDIQUE",
  "OntologyClass": "http://ontology.ascat-sarl.cd/core#ContratPDL145T",
  "FilePath": "contracts/contract.pdf",
  "ProjectID": 1
}
```

### GET /api/documents/:id

Get document details.

### PUT /api/documents/:id

Update a document. **Requires ADMIN or SUPERVISOR role.**

### DELETE /api/documents/:id

Delete a document. **Requires ADMIN or SUPERVISOR role.**

### GET /api/documents/:id/download

Download the physical document file.

---

## Report Endpoints

### GET /api/reports

List reports (paginated).

### POST /api/reports

Create a report. **Requires FINANCE role.**

**Request:**
```json
{
  "ValidationID": 1,
  "ProjectID": 1,
  "GeneratedBy": "Finance User"
}
```

### GET /api/reports/:id

Get report details.

### DELETE /api/reports/:id

Delete a report. **Requires ADMIN or SUPERVISOR role.**

---

## Dashboard Endpoints

### GET /api/dashboard/stats

Get aggregated dashboard statistics.

**Response (200):**
```json
{
  "projects": { "total": 3, "recent": [...] },
  "tasks": { "total": 10, "byStatus": {...}, "completionRate": 50 },
  "budget": { "totalBudget": 100000, "totalExpenses": 45000, "utilization": 45 },
  "expenses": { "total": 15, "totalCost": 45000 },
  "resources": { "total": 8 },
  "documents": { "total": 20, "byCategory": {...} },
  "sites": { "total": 65, "territories": 4 },
  "measurements": { "total": 120, "recent": [...] },
  "validations": { "total": 30, "byStatus": {...}, "recent": [...] }
}
```

---

## Health Check

### GET /api/health

Returns server health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-15T12:00:00.000Z",
  "uptime": 3600
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing the problem"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate assignment) |
| 500 | Internal server error |

---

*Last updated: September 18, 2026*
