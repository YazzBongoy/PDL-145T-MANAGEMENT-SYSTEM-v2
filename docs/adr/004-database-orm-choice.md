# ADR-004: Database & ORM choice (PostgreSQL + Prisma)

## Status

Accepted

## Context

The PDL-145T Management System requires a robust database solution to store and manage pilot
logbook data, aircraft information, maintenance records, and user accounts. The system needs to
handle:

- Complex relational data with foreign key relationships
- ACID compliance for critical flight and maintenance data
- Efficient queries for reporting and analytics
- Strong data integrity and validation
- Scalability for growing datasets
- Type-safe database interactions in TypeScript
- Database schema versioning and migrations

## Decision

We will use **PostgreSQL** as the database and **Prisma** as the ORM/database toolkit.

## Rationale

### PostgreSQL

**Pros:**

- **ACID Compliance**: Full ACID transactions ensure data integrity for critical flight records
- **Rich Data Types**: Native support for JSON, arrays, and custom types
- **Performance**: Excellent query performance with advanced indexing capabilities
- **Reliability**: Battle-tested in production environments
- **Standards Compliance**: Full SQL standard compliance
- **Extensibility**: Rich ecosystem of extensions (PostGIS, full-text search, etc.)
- **JSON Support**: Native JSON/JSONB support for flexible data storage
- **Open Source**: No licensing costs, strong community support

**Cons:**

- **Resource Usage**: Higher memory and CPU usage compared to lighter databases
- **Complexity**: More complex setup and administration than simpler databases

### Prisma

**Pros:**

- **Type Safety**: Full TypeScript support with generated types
- **Developer Experience**: Excellent IDE support and auto-completion
- **Schema Management**: Declarative schema with automatic migrations
- **Query Builder**: Intuitive, type-safe query API
- **Database Introspection**: Can generate schema from existing databases
- **Multi-Database Support**: Easy to switch between databases if needed
- **Modern Architecture**: Built for modern Node.js applications
- **Active Development**: Strong community and regular updates

**Cons:**

- **Learning Curve**: Different from traditional ORMs
- **Query Limitations**: Some complex queries may require raw SQL
- **Bundle Size**: Larger bundle size compared to lightweight ORMs

**Alternatives considered:**

**Database alternatives:**

- **MySQL**: Good performance but less advanced features than PostgreSQL
- **SQLite**: Too limited for multi-user application requirements
- **MongoDB**: Document database not ideal for highly relational aviation data
- **SQL Server**: Commercial licensing costs, Windows-centric

**ORM alternatives:**

- **TypeORM**: More traditional ORM approach, but less type-safe
- **Sequelize**: Mature but lacks modern TypeScript support
- **Knex.js**: Query builder only, requires more boilerplate
- **Drizzle**: Modern alternative but smaller ecosystem

## Implementation

### Database Schema Design

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  firstName   String
  lastName    String
  licenseNumber String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  flights     Flight[]
  aircraft    Aircraft[]

  @@map("users")
}

model Aircraft {
  id              String   @id @default(cuid())
  registration    String   @unique
  make            String
  model           String
  serialNumber    String?
  yearManufactured Int?
  totalTime       Float    @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  owner      User     @relation(fields: [ownerId], references: [id])
  ownerId    String
  flights    Flight[]
  maintenance MaintenanceRecord[]

  @@map("aircraft")
}

model Flight {
  id              String   @id @default(cuid())
  date            DateTime
  departureAirport String
  arrivalAirport  String
  flightTime      Float
  pilotInCommand  Boolean  @default(false)
  crossCountry    Boolean  @default(false)
  night           Boolean  @default(false)
  instrument      Boolean  @default(false)
  remarks         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  pilot       User     @relation(fields: [pilotId], references: [id])
  pilotId     String
  aircraft    Aircraft @relation(fields: [aircraftId], references: [id])
  aircraftId  String

  @@map("flights")
}

model MaintenanceRecord {
  id              String   @id @default(cuid())
  date            DateTime
  description     String
  maintenanceType String
  technicianName  String
  cost            Float?
  nextDueHours    Float?
  nextDueDate     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  aircraft    Aircraft @relation(fields: [aircraftId], references: [id])
  aircraftId  String

  @@map("maintenance_records")
}
```

### Database Configuration

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Migration Strategy

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

## Consequences

**Positive:**

- **Data Integrity**: ACID compliance ensures critical flight data is never lost or corrupted
- **Type Safety**: Full TypeScript integration eliminates runtime database errors
- **Developer Productivity**: Intuitive API and excellent tooling reduce development time
- **Schema Evolution**: Automatic migrations make database changes trackable and reversible
- **Performance**: PostgreSQL's advanced query optimization handles complex aviation queries efficiently
- **Compliance**: Strong data integrity supports aviation regulatory requirements
- **Scalability**: PostgreSQL scales well with growing pilot logbook data

**Negative:**

- **Resource Requirements**: PostgreSQL requires more system resources than lighter databases
- **Learning Curve**: Team needs to learn Prisma's approach to database interactions
- **Query Complexity**: Some advanced queries may require raw SQL
- **Migration Complexity**: Complex schema changes may require careful migration planning

## Database Naming Convention

Following the user's rule, the local PostgreSQL database will be named `pdl_management` to
maintain consistency with the existing naming convention.

## Security Considerations

- Use connection pooling for production deployments
- Implement proper authentication and authorization
- Regular database backups and point-in-time recovery
- Use environment variables for database credentials
- Enable SSL connections in production

## Performance Optimization

- Implement appropriate indexes for frequently queried fields
- Use database connection pooling
- Consider read replicas for reporting queries
- Monitor query performance with PostgreSQL's built-in tools
- Implement proper caching strategies

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL vs MySQL Comparison](https://www.postgresql.org/about/featurematrix/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Database Design for Aviation Applications](https://www.faa.gov/about/office_org/headquarters_offices/ait/about/aviation_research/research_and_development/database_design_principles/)

---

**Date:** 2025-01-07  
**Author:** Development Team  
**Template:** Based on [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md)

<citations>
<document>
    <document_type>RULE</document_type>
    <document_id>JlWy4D2daEREthDuMjhGZs</document_id>
</document>
</citations>
