# Multi-Tenant Real Estate Platform Guide

## Overview

This platform implements a **multi-tenant SaaS architecture** where:
- A **Super Admin** manages multiple real estate developer clients
- Each **Client** gets their own control panel to manage projects, floors, and apartments
- Each client can invite **Agents** to help with sales
- The public site shows projects from all clients

## Architecture

### Database Design

The multi-tenant design uses **client isolation**:

```
┌─────────────┐
│   Clients   │ (Tenants)
└──────┬──────┘
       │
       ├─→ Users (Owner + Agents)
       ├─→ Projects
       │    └─→ Floors
       │         └─→ Apartments
       └─→ Reservations
```

**Key Point**: Every record (project, floor, apartment, reservation) includes a `clientId` to ensure data isolation.

### Schema Changes (from single to multi-tenant)

#### Before
```prisma
model AdminUser {
  id    String @id @default(cuid())
  email String @unique
  ...
}

model Project {
  id   String @id @default(cuid())
  name String
  // No tenant association
}
```

#### After
```prisma
model Client {
  id    String @id @default(cuid())
  name  String
  email String
  // Tenant data
}

model User {
  id       String @id @default(cuid())
  clientId String? // null = super admin
  role     String // SUPER_ADMIN | OWNER | AGENT
  // User belongs to a client
}

model Project {
  id       String @id @default(cuid())
  clientId String // REQUIRED - must belong to a client
  name     String
  // Every project tied to client
}
```

## User Roles & Permissions

### SUPER_ADMIN
- Access to all clients
- Can create new clients
- Can create users for any client
- Can view global analytics
- Uses `/admin/dashboard` (Super Admin Dashboard)

### OWNER
- Belongs to ONE client
- Can manage their client's projects
- Can invite agents to their team
- Can view their analytics
- Uses `/admin/dashboard` (Client Dashboard)

### AGENT
- Belongs to ONE client
- Read-only access to projects
- Cannot create or modify projects
- Can be removed by OWNER

### PUBLIC USER
- No login required
- Can browse all projects
- Can view 3D buildings
- Can submit reservations

## Flow Diagrams

### Super Admin Creating a Client

```
Super Admin
    ↓
/admin/clients/new
    ↓
Creates Client: "Prestige Developers"
    ↓
Redirects to: /admin/clients/[clientId]/users/new
    ↓
Creates User: owner@prestige.com (OWNER role)
    ↓
Client account ready!
```

### Client Creating a Project

```
Client Owner (owner@prestige.com)
    ↓
Login: /admin/login
    ↓
/admin/dashboard (Client Dashboard)
    ↓
Click: "New Project"
    ↓
POST /api/projects
  → clientId auto-added from session
  → (clientId=prestige_dev_id, slug=unique per client)
    ↓
Project created & assigned to client
```

### Data Isolation in Action

```
Client: "Prestige Developers" (clientId = "abc123")
  Projects:
    - Project A (clientId = "abc123")
    - Project B (clientId = "abc123")

Client: "Modern Living" (clientId = "xyz789")
  Projects:
    - Project C (clientId = "xyz789")

Query: GET /api/projects?clientId=abc123
  ↓
Returns: Project A, Project B (only Prestige's projects)
```

## API Changes for Multi-Tenancy

### Project API (Now Multi-Tenant)

**Before:**
```javascript
// Anyone could create projects anywhere
POST /api/projects
{
  name: "Luxury Residences",
  slug: "luxury-residences",
  location: "Downtown"
}
// Created without client association
```

**After:**
```javascript
// MUST be authenticated + client member
POST /api/projects
{
  name: "Luxury Residences",
  slug: "luxury-residences",
  location: "Downtown"
}
// Automatically adds:
// {
//   ...data,
//   clientId: session.user.clientId  ← From logged-in user
// }

// Validation: slug must be unique per client
// @@unique([clientId, slug])
```

### New Admin APIs

```javascript
// Create client (Super Admin only)
POST /api/admin/clients
{
  name: "Prestige Developers",
  email: "prestige@example.com",
  phone: "+1-555-0100",
  city: "Downtown"
}

// Create user for client (Super Admin or OWNER)
POST /api/admin/users
{
  email: "john@prestige.com",
  password: "secure123",
  name: "John Prestige",
  role: "OWNER",
  clientId: "abc123"
}

// List users (filtered by role)
GET /api/admin/users
// Super Admin: sees all users
// Owner: sees only their team

// Delete user (OWNER can't delete other OWNERS)
DELETE /api/admin/users/[userId]
```

## Session & Authentication

### JWT Token Payload

When a user logs in, their session includes:

```javascript
{
  user: {
    id: "user123",
    email: "owner@prestige.com",
    name: "John Prestige",
    role: "OWNER",              // ← NEW
    clientId: "prestige_id",    // ← NEW
    clientName: "Prestige Dev"  // ← NEW
  }
}
```

This is used to:
1. Determine which dashboard to show (Super Admin vs Client)
2. Filter data to show only the user's client projects
3. Control permissions (can this user create projects?)

### Auth Flow

```javascript
// lib/auth.ts
Credentials({
  authorize: async (credentials) => {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Validation...
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,        // Includes role
      clientId: user.clientId // Includes client association
    };
  }
})
```

## Data Filtering Examples

### Get Projects for Logged-In Client

```javascript
// app/api/projects/route.ts
const session = await auth();
const clientId = session.user.clientId;

const projects = await prisma.project.findMany({
  where: { clientId }  // ← Only this client's projects
});
```

### Get Apartments for a Floor (with client check)

```javascript
// app/api/floors/[floorId]/apartments/route.ts
const session = await auth();
const clientId = session.user.clientId;

const floor = await prisma.floor.findUnique({
  where: { id: floorId },
  include: { project: true }
});

// Verify client owns this floor's project
if (floor.project.clientId !== clientId && role !== 'SUPER_ADMIN') {
  return error('Forbidden');
}

const apartments = await prisma.apartment.findMany({
  where: { floorId }
});
```

## Security Considerations

### 1. Always Verify Ownership

When a user tries to access/modify a project:
```javascript
// ❌ WRONG - Don't do this
const project = await prisma.project.findUnique({ id: projectId });

// ✅ RIGHT - Verify ownership
const project = await prisma.project.findUnique({ id: projectId });
if (project.clientId !== session.user.clientId) {
  return error('Forbidden');
}
```

### 2. Filter Queries by ClientId

```javascript
// ❌ WRONG - Shows other clients' data to wrong users
const apartments = await prisma.apartment.findMany({
  where: { floorId }  // Could be any client's floor!
});

// ✅ RIGHT - Verify client owns the floor first
const floor = await prisma.floor.findUnique({ id: floorId });
if (floor.project.clientId !== clientId) {
  return error('Forbidden');
}
const apartments = await prisma.apartment.findMany({
  where: { floorId }
});
```

### 3. Roles Control Actions

```javascript
// Only OWNER can create projects
if (role !== 'OWNER') {
  return error('Only owners can create projects');
}

// Only OWNER can manage team
if (role !== 'OWNER') {
  return error('Only owners can manage team');
}

// AGENT can view but not create
if (role === 'AGENT' && method === 'POST') {
  return error('Agents cannot create projects');
}
```

## Testing Multi-Tenant Features

### Create a New Test Client

1. Login as Super Admin:
   - Email: `superadmin@example.com`
   - Password: `superadmin123`

2. Go to `/admin/clients` → **+ Create Client**

3. Fill in:
   - Company Name: "Test Builders"
   - Email: test@builders.com
   - City: "Test City"

4. Click **Create Client** → Redirects to create user

5. Create owner account:
   - Email: owner@testbuilders.com
   - Password: testpass123
   - Role: OWNER

6. Now login as the new owner and create projects!

### Verify Data Isolation

```javascript
// Super admin can see all projects
GET /api/projects → Returns projects from all clients

// Client owner sees only their projects
GET /api/projects → Filters by clientId automatically

// Create project as Client A
// Create project as Client B
// Verify they don't see each other's projects
```

## Upgrading from Single-Tenant

If you're upgrading an existing single-tenant system:

### 1. Update Schema
```bash
npx prisma migrate dev --name add_multi_tenant
```

### 2. Migrate Data
```typescript
// Create default "Legacy" client
const legacyClient = await prisma.client.create({
  data: {
    name: "Legacy Projects",
    email: "legacy@example.com"
  }
});

// Assign all existing projects to it
await prisma.project.updateMany({
  data: { clientId: legacyClient.id }
});

// Create admin user for legacy client
await prisma.user.create({
  data: {
    email: "legacy-admin@example.com",
    password: hashedPassword,
    role: "OWNER",
    clientId: legacyClient.id
  }
});
```

### 3. Verify Everything
- Old projects still load
- New clients can be created
- Data isolation works

## Monitoring & Debugging

### Check Client Isolation

```sql
-- How many projects per client?
SELECT clientId, COUNT(*) as projects 
FROM "Project" 
GROUP BY clientId;

-- Who are the users?
SELECT id, email, role, clientId 
FROM "User" 
ORDER BY clientId;

-- Are reservations tied to clients?
SELECT r.id, r.clientId, r.projectId
FROM "ReservationRequest" r
JOIN "Project" p ON r.projectId = p.id
WHERE r.clientId != p.clientId;  -- Should be empty!
```

### Debug Session Data

```javascript
// In any API route
const session = await auth();
console.log('Session:', {
  userId: session.user.id,
  role: session.user.role,
  clientId: (session.user as any).clientId
});
```

## Best Practices

1. **Always verify `clientId` on protected routes**
   - Never trust user input for `clientId`
   - Use `session.user.clientId` from auth

2. **Index by `clientId`**
   - `@@index([clientId])` on all models
   - Improves query performance

3. **Use unique constraints wisely**
   - `@@unique([clientId, slug])` for projects
   - Projects can have same slug if in different clients

4. **Test data isolation**
   - Create multiple test clients
   - Verify users can't see each other's data

5. **Log important actions**
   - Who created what
   - When data was accessed
   - Permission changes

## Example: Adding a New Feature

If you want to add notifications (emails to clients when they get reservations):

### 1. Add to Schema
```prisma
model Notification {
  id        String   @id @default(cuid())
  clientId  String   // ← Tie to client
  userId    String
  message   String
  sent      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  client User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([clientId])
}
```

### 2. Create in API
```javascript
// When reservation created
const notification = await prisma.notification.create({
  data: {
    clientId: project.clientId,  // ← Client who owns the project
    userId: projectOwner.id,
    message: `New reservation for ${apartment.number}`
  }
});

// Send email to client
await sendEmail(project.client.email, notification.message);
```

### 3. View in Dashboard
```javascript
// Client sees their notifications
const notifications = await prisma.notification.findMany({
  where: { clientId: session.user.clientId }
});
```

This ensures each client only sees their own notifications!

## Summary

The multi-tenant system provides:
- ✅ Complete data isolation per client
- ✅ Role-based permissions
- ✅ Scalable architecture
- ✅ Security through database constraints
- ✅ Easy to add new clients
- ✅ Public site works for all clients

Every query filters by `clientId`, ensuring users can't access other clients' data, even if they know the URL or API endpoints.
