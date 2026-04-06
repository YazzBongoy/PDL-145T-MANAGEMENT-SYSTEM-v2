# PDL-145T API Specification

## Overview

This document defines the REST API endpoints for the three specialized agents in the PDL-145T management system.

## Base URL

```
https://api.pdl145t.maiNdombe.gov.cd/v1
```

## Authentication

All API endpoints require JWT authentication.

```
Authorization: Bearer <JWT_TOKEN>
```

## Common Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

# 1. PROJECT SUPERVISOR AGENT API

## 1.1 Project Management

### Create New Project

```
POST /project-supervisor/projects
```

**Request Body:**

```json
{
  "infrastructureId": "uuid",
  "projectManagerId": "uuid",
  "startDate": "2024-01-01",
  "expectedEndDate": "2024-12-31",
  "methodology": "agile|scrum|pert",
  "phases": [
    {
      "name": "Foundation",
      "description": "Foundation and groundwork",
      "estimatedDuration": 30,
      "dependencies": [],
      "resources": [
        {
          "type": "human",
          "name": "Construction Workers",
          "quantity": 10
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "infrastructureId": "uuid",
    "status": "planning",
    "pertAnalysis": {
      "criticalPath": ["phase1", "phase2"],
      "totalDuration": 180,
      "criticalActivities": []
    }
  }
}
```

### Get Project Overview

```
GET /project-supervisor/projects/{projectId}
```

### Update Project Status

```
PUT /project-supervisor/projects/{projectId}/status
```

**Request Body:**

```json
{
  "status": "in_progress|completed|on_hold|cancelled",
  "notes": "Status update notes"
}
```

### Generate PERT Chart

```
GET /project-supervisor/projects/{projectId}/pert-chart
```

**Response:**

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "phase1",
        "name": "Foundation",
        "duration": 30,
        "earliestStart": 0,
        "latestFinish": 30
      }
    ],
    "edges": [
      {
        "from": "phase1",
        "to": "phase2",
        "dependency": "finish-to-start"
      }
    ],
    "criticalPath": ["phase1", "phase2"]
  }
}
```

## 1.2 Agile/Scrum Management

### Create Sprint

```
POST /project-supervisor/projects/{projectId}/sprints
```

**Request Body:**

```json
{
  "name": "Sprint 1",
  "goal": "Complete foundation work",
  "startDate": "2024-01-01",
  "endDate": "2024-01-14",
  "backlogItems": [
    {
      "title": "Excavation",
      "description": "Site excavation for foundation",
      "storyPoints": 8,
      "assigneeId": "uuid"
    }
  ]
}
```

### Get Sprint Board

```
GET /project-supervisor/projects/{projectId}/sprints/{sprintId}/board
```

**Response:**

```json
{
  "success": true,
  "data": {
    "columns": {
      "todo": [],
      "in_progress": [],
      "done": []
    },
    "burndownChart": {
      "planned": [40, 32, 24, 16, 8, 0],
      "actual": [40, 35, 28, 20, 12, 5]
    }
  }
}
```

## 1.3 Resource Management

### Get Resource Allocation

```
GET /project-supervisor/projects/{projectId}/resources
```

### Update Resource Allocation

```
PUT /project-supervisor/projects/{projectId}/resources
```

**Request Body:**

```json
{
  "resources": [
    {
      "type": "human",
      "name": "Civil Engineer",
      "quantity": 2,
      "allocation": 100,
      "fromDate": "2024-01-01",
      "toDate": "2024-12-31"
    }
  ]
}
```

## 1.4 Risk Management

### Create Risk

```
POST /project-supervisor/projects/{projectId}/risks
```

**Request Body:**

```json
{
  "title": "Weather Delays",
  "description": "Potential delays due to rainy season",
  "probability": 4,
  "impact": 3,
  "mitigationStrategy": "Plan indoor activities during rainy season",
  "ownerId": "uuid"
}
```

### Get Risk Matrix

```
GET /project-supervisor/projects/{projectId}/risks/matrix
```

## 1.5 Reporting and Analytics

### Get Project Dashboard

```
GET /project-supervisor/dashboard
```

### Generate Progress Report

```
GET /project-supervisor/projects/{projectId}/reports/progress
```

### Get Territory Overview

```
GET /project-supervisor/territories/{territoryId}/overview
```

---

# 2. FINANCE AND LOGISTICS AGENT API

## 2.1 Budget Management

### Create Budget

```
POST /finance/budgets
```

**Request Body:**

```json
{
  "infrastructureId": "uuid",
  "totalAllocated": 500000.0,
  "categories": {
    "materials": 200000.0,
    "labor": 150000.0,
    "equipment": 100000.0,
    "transportation": 30000.0,
    "contingency": 20000.0
  }
}
```

### Get Budget Status

```
GET /finance/budgets/{budgetId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "infrastructureId": "uuid",
    "totalAllocated": 500000.0,
    "spent": 125000.0,
    "remaining": 375000.0,
    "utilizationPercent": 25.0,
    "categories": {
      "materials": {
        "allocated": 200000.0,
        "spent": 75000.0,
        "remaining": 125000.0
      }
    }
  }
}
```

### Record Transaction

```
POST /finance/budgets/{budgetId}/transactions
```

**Request Body:**

```json
{
  "amount": 5000.0,
  "transactionType": "expense",
  "description": "Purchase of cement",
  "category": "materials",
  "referenceNumber": "INV-2024-001",
  "transactionDate": "2024-01-15"
}
```

## 2.2 Inventory Management

### Get Inventory Status

```
GET /finance/inventory
```

### Add Material to Inventory

```
POST /finance/inventory/materials
```

**Request Body:**

```json
{
  "materialId": "uuid",
  "quantity": 100,
  "unitCost": 25.0,
  "supplierId": "uuid",
  "deliveryDate": "2024-01-20",
  "storageLocation": "Inongo Warehouse"
}
```

### Update Stock Level

```
PUT /finance/inventory/materials/{materialId}/stock
```

**Request Body:**

```json
{
  "quantity": 150,
  "operation": "add|subtract|set",
  "reason": "Delivery received",
  "referenceNumber": "DEL-2024-001"
}
```

### Get Low Stock Alert

```
GET /finance/inventory/alerts/low-stock
```

## 2.3 Supplier Management

### Create Supplier

```
POST /finance/suppliers
```

**Request Body:**

```json
{
  "name": "ABC Construction Materials",
  "contactPerson": "John Doe",
  "email": "john@abc.com",
  "phone": "+243900000001",
  "address": "Kinshasa, DRC",
  "specialties": ["cement", "steel", "bricks"]
}
```

### Get Supplier Performance

```
GET /finance/suppliers/{supplierId}/performance
```

**Response:**

```json
{
  "success": true,
  "data": {
    "supplierId": "uuid",
    "name": "ABC Construction Materials",
    "metrics": {
      "onTimeDelivery": 85.5,
      "qualityRating": 4.2,
      "totalOrders": 15,
      "totalValue": 150000.0
    }
  }
}
```

## 2.4 Logistics and Transportation

### Plan Transportation Route

```
POST /finance/logistics/routes
```

**Request Body:**

```json
{
  "from": "Kinshasa Warehouse",
  "to": "Inongo Construction Site",
  "materials": [
    {
      "materialId": "uuid",
      "quantity": 50,
      "weight": 2500
    }
  ],
  "vehicleType": "truck",
  "requestedDate": "2024-01-25"
}
```

### Track Shipment

```
GET /finance/logistics/shipments/{shipmentId}
```

### Get Transportation Costs

```
GET /finance/logistics/costs
```

## 2.5 Financial Reporting

### Generate Financial Report

```
GET /finance/reports/financial
```

**Query Parameters:**

- `startDate`: Start date for the report
- `endDate`: End date for the report
- `territoryId`: Filter by territory (optional)
- `type`: Report type (budget|expenses|summary)

### Get Cash Flow Analysis

```
GET /finance/reports/cash-flow
```

### Export Financial Data

```
GET /finance/reports/export
```

**Query Parameters:**

- `format`: Export format (pdf|excel|csv)
- `reportType`: Type of report to export

---

# 3. CONSTRUCTION EXECUTION AGENT API

## 3.1 Site Inspection

### Create Site Inspection

```
POST /construction/inspections
```

**Request Body:**

```json
{
  "infrastructureId": "uuid",
  "inspectionDate": "2024-01-15",
  "phaseId": "uuid",
  "inspectorId": "uuid",
  "notes": "Foundation inspection completed"
}
```

### Record Measurements

```
POST /construction/inspections/{inspectionId}/measurements
```

**Request Body:**

```json
{
  "measurements": [
    {
      "measurementType": "foundation_depth",
      "expectedValue": 1.5,
      "actualValue": 1.6,
      "unit": "meters",
      "tolerance": 0.1,
      "notes": "Within acceptable range"
    }
  ]
}
```

### Upload Site Photos

```
POST /construction/inspections/{inspectionId}/photos
```

**Request Body (multipart/form-data):**

```
file: [image file]
description: "Foundation work progress"
gpsCoordinates: "18.2876,-2.0867"
```

## 3.2 Progress Tracking

### Update Construction Progress

```
PUT /construction/projects/{projectId}/phases/{phaseId}/progress
```

**Request Body:**

```json
{
  "progress": 75,
  "notes": "Foundation work 75% complete",
  "completedActivities": ["excavation", "reinforcement_placement"],
  "nextActivities": ["concrete_pouring"]
}
```

### Get Construction Status

```
GET /construction/projects/{projectId}/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "overallProgress": 35,
    "phases": [
      {
        "id": "uuid",
        "name": "Foundation",
        "progress": 75,
        "status": "in_progress",
        "startDate": "2024-01-01",
        "expectedEndDate": "2024-01-30"
      }
    ]
  }
}
```

## 3.3 Quality Control

### Record Quality Check

```
POST /construction/quality-checks
```

**Request Body:**

```json
{
  "inspectionId": "uuid",
  "checklistItems": [
    {
      "item": "Concrete strength test",
      "result": "pass",
      "notes": "Concrete strength meets specifications",
      "evidence": "test_report_001.pdf"
    }
  ]
}
```

### Report Quality Issue

```
POST /construction/quality-issues
```

**Request Body:**

```json
{
  "inspectionId": "uuid",
  "title": "Uneven foundation surface",
  "description": "Foundation surface not level according to specifications",
  "severity": "medium",
  "location": "Section A, Grid 1-3",
  "photos": ["photo1.jpg", "photo2.jpg"]
}
```

## 3.4 Billing and Validation

### Generate Billing Report

```
POST /construction/billing-reports
```

**Request Body:**

```json
{
  "siteInspectionId": "uuid",
  "reportDate": "2024-01-15",
  "completedWork": [
    {
      "description": "Foundation excavation",
      "quantity": 100,
      "unit": "cubic_meters",
      "unitRate": 15.0,
      "totalAmount": 1500.0
    }
  ],
  "materialUsed": [
    {
      "materialId": "uuid",
      "quantityUsed": 50,
      "unitCost": 25.0,
      "totalCost": 1250.0
    }
  ],
  "laborHours": [
    {
      "workerCategory": "skilled_laborer",
      "hoursWorked": 40,
      "hourlyRate": 8.0,
      "totalCost": 320.0,
      "workDate": "2024-01-15"
    }
  ]
}
```

### Validate Measurements

```
POST /construction/measurements/validate
```

**Request Body:**

```json
{
  "measurementIds": ["uuid1", "uuid2"],
  "validatorId": "uuid",
  "validationNotes": "All measurements within acceptable tolerance"
}
```

### Get Billing Summary

```
GET /construction/billing-reports/{reportId}
```

## 3.5 Field Operations

### Get Site Checklist

```
GET /construction/sites/{siteId}/checklist
```

### Update Site Conditions

```
PUT /construction/sites/{siteId}/conditions
```

**Request Body:**

```json
{
  "weather": "sunny",
  "temperature": 28,
  "humidity": 65,
  "workersPresent": 8,
  "equipmentStatus": "operational",
  "safetyIssues": []
}
```

### Get Construction Schedule

```
GET /construction/projects/{projectId}/schedule
```

---

# 4. CROSS-AGENT COMMUNICATION API

## 4.1 Notifications

### Send Notification

```
POST /notifications
```

**Request Body:**

```json
{
  "recipientId": "uuid",
  "title": "Budget Approval Required",
  "message": "Billing report #BR-2024-001 requires financial validation",
  "type": "warning",
  "relatedEntityType": "billing_report",
  "relatedEntityId": "uuid"
}
```

### Get Notifications

```
GET /notifications
```

### Mark Notification as Read

```
PUT /notifications/{notificationId}/read
```

## 4.2 Workflow Management

### Trigger Workflow

```
POST /workflows/trigger
```

**Request Body:**

```json
{
  "workflowType": "billing_validation",
  "entityId": "uuid",
  "initiatedBy": "uuid",
  "data": {
    "reportId": "uuid",
    "amount": 5000.0
  }
}
```

### Get Workflow Status

```
GET /workflows/{workflowId}/status
```

## 4.3 Data Synchronization

### Sync Data

```
POST /sync/data
```

**Request Body:**

```json
{
  "entityType": "project",
  "entityId": "uuid",
  "lastSyncTimestamp": "2024-01-15T10:30:00Z"
}
```

### Get Sync Status

```
GET /sync/status
```

---

# 5. REPORTING AND ANALYTICS API

## 5.1 Dashboard Data

### Get Executive Dashboard

```
GET /reports/dashboard/executive
```

### Get Territory Dashboard

```
GET /reports/dashboard/territory/{territoryId}
```

### Get Project Dashboard

```
GET /reports/dashboard/project/{projectId}
```

## 5.2 Custom Reports

### Generate Custom Report

```
POST /reports/custom
```

**Request Body:**

```json
{
  "reportType": "project_progress",
  "filters": {
    "territoryId": "uuid",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "infrastructureType": "health_center"
  },
  "format": "pdf"
}
```

### Get Report Status

```
GET /reports/{reportId}/status
```

### Download Report

```
GET /reports/{reportId}/download
```

## 5.3 Real-time Data

### Get Live Project Status

```
GET /live/projects/status
```

### Get Live Financial Data

```
GET /live/financial/summary
```

### WebSocket Connection

```
WSS /live/updates
```

**Message Format:**

```json
{
  "type": "project_update",
  "data": {
    "projectId": "uuid",
    "progress": 45,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

---

# 6. INTEGRATION ENDPOINTS

## 6.1 External Systems

### Import Data

```
POST /integration/import
```

### Export Data

```
POST /integration/export
```

### Webhook Endpoints

```
POST /webhooks/financial-system
POST /webhooks/construction-management
POST /webhooks/government-reporting
```

## 6.2 Mobile App Support

### Mobile Authentication

```
POST /mobile/auth/login
```

### Sync Mobile Data

```
POST /mobile/sync
```

### Offline Data Support

```
GET /mobile/offline-data
```
