# Real Estate Platform - Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │   Home Page  │  │ Projects List│  │ Project Details│   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ Admin Login  │  │  Dashboard   │  │Project Manager │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │  HTTP/HTTPS with JSON             │
         │                                    │
         ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (App Router)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Handlers (/api/*)                 │  │
│  │  • Projects      • Floors       • Apartments         │  │
│  │  • Reservations  • Auth                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware & Authentication                  │  │
│  │  • NextAuth v5  • JWT Sessions  • Admin Protection  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Server Components & Data Fetching             │  │
│  │  • Direct DB access • Prisma ORM  • Validation     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                          
         │  Database Queries        
         │                          
         ▼                          
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Projects │  │  Floors  │  │Apartments│  │AdminUsers  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       ReservationRequests                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19**: Modern component-based UI
- **Next.js 16**: Full-stack React framework with App Router
- **TailwindCSS v4**: Utility-first CSS framework
- **shadcn/ui**: Pre-built, customizable components
- **React Three Fiber**: React renderer for Three.js
- **Drei**: Useful helpers for React Three Fiber

### Backend
- **Next.js Route Handlers**: API routes (/app/api/*)
- **NextAuth v5**: Authentication and authorization
- **Prisma ORM**: Type-safe database access
- **Zod**: Runtime type validation and parsing

### Database
- **PostgreSQL**: Relational database
- **Prisma Client**: Database client and ORM

### Infrastructure
- **Vercel**: Deployment platform (recommended)
- **Node.js 18+**: Runtime

## Database Schema

### Core Entities

```prisma
Project
├── id: String (PK)
├── name: String
├── slug: String (Unique)
├── description: String?
├── location: String
├── coverImage: String?
├── floorsCount: Int
├── createdAt: DateTime
└── updatedAt: DateTime
    ├── Relationship: Floor[] (1-to-many)
    ├── Relationship: Apartment[] (1-to-many)
    └── Relationship: ReservationRequest[] (1-to-many)

Floor
├── id: String (PK)
├── projectId: String (FK)
├── floorNumber: Int
├── label: String?
├── createdAt: DateTime
└── updatedAt: DateTime
    ├── Relationship: Project (many-to-1)
    └── Relationship: Apartment[] (1-to-many)

Apartment
├── id: String (PK)
├── projectId: String (FK)
├── floorId: String (FK)
├── number: String
├── rooms: Int
├── area: Float
├── price: Float
├── status: String (AVAILABLE|RESERVED|SOLD)
├── coordinates: Json?
├── createdAt: DateTime
└── updatedAt: DateTime
    ├── Relationship: Project (many-to-1)
    ├── Relationship: Floor (many-to-1)
    └── Relationship: ReservationRequest[] (1-to-many)

AdminUser
├── id: String (PK)
├── email: String (Unique)
├── password: String (Hashed)
├── name: String?
├── createdAt: DateTime
└── updatedAt: DateTime

ReservationRequest
├── id: String (PK)
├── name: String
├── phone: String
├── email: String
├── message: String?
├── projectId: String (FK)
├── apartmentId: String? (FK)
├── status: String (PENDING|CONTACTED|COMPLETED)
├── createdAt: DateTime
└── updatedAt: DateTime
    ├── Relationship: Project (many-to-1)
    └── Relationship: Apartment (many-to-1)
```

## API Architecture

### Route Organization

```
/app/api/
├── projects/
│   ├── route.ts                    # GET (all), POST (create)
│   └── [slug]/
│       ├── route.ts                # GET (detail), PATCH, DELETE
│       └── floors/
│           └── route.ts            # GET (list), POST (create)
├── floors/
│   └── [floorId]/
│       └── apartments/
│           └── route.ts            # GET (list), POST (create)
├── apartments/
│   └── [id]/
│       └── route.ts                # PATCH, DELETE
├── reservations/
│   └── route.ts                    # GET (admin), POST (create)
└── auth/
    └── [...nextauth]/
        └── route.ts                # NextAuth handler
```

### Request/Response Flow

```
1. CLIENT REQUEST
   ├── Headers: Authorization (JWT token)
   ├── Method: GET/POST/PATCH/DELETE
   └── Body: JSON payload

2. NEXT.JS ROUTE HANDLER
   ├── Parse request body
   ├── Validate with Zod schema
   ├── Check authentication
   └── Access control checks

3. PRISMA ORM
   ├── Type-safe query
   ├── Database transaction
   └── Result mapping

4. SERVER RESPONSE
   ├── Status code (200/201/400/401/403/500)
   └── JSON payload with data or error

5. CLIENT
   ├── Handle response
   ├── Update UI state
   └── Display result to user
```

## Authentication Flow

### NextAuth Configuration

```
├── Credentials Provider
│   ├── Email + Password
│   ├── Database lookup (AdminUser)
│   └── bcryptjs verification
├── Session Strategy: JWT
├── Callbacks
│   ├── jwt: Token enrichment
│   └── session: Session customization
└── Pages
    └── signIn: /admin/login
```

### Protected Routes

```
Public Routes (No Auth)
├── /                  (Home)
├── /projects          (Projects listing)
└── /projects/[slug]   (Project details)

Protected Routes (Requires Auth)
├── /admin             (Dashboard)
├── /admin/projects    (Project management)
└── /api/*             (All API routes)
```

## Frontend Architecture

### Component Hierarchy

```
Layout
├── Navigation (Global)
└── Page Router
    ├── Public Pages
    │   ├── Home
    │   ├── Projects List
    │   └── Project Details
    │       ├── 3D Building Scene
    │       ├── Apartment Grid
    │       ├── Filters Panel
    │       └── Apartment Modal
    └── Admin Pages
        ├── Admin Layout (with Nav)
        ├── Dashboard
        └── Projects Management
            └── Project Form
```

### 3D Building Component

```
BuildingScene
├── Canvas (Three.js)
│   ├── Camera (Perspective)
│   ├── Lighting
│   │   ├── Ambient Light
│   ├── Directional Light
│   └── Point Light
│   ├── Floor Meshes (1-N)
│   │   ├── Floor Platform (Box)
│   │   ├── Apartment Units (N)
│   │   │   └── Status Color
│   │   └── Floor Label
│   └── Grid Helper
├── OrbitControls (Interaction)
└── Auto-camera transitions
```

## State Management

### Server State
- Prisma ORM queries
- Database as source of truth
- Server Components for data fetching

### Client State
- React hooks (useState)
- Component-level for UI state
- Form state with React Hook Form

### Session State
- NextAuth JWT tokens
- Secure HTTP-only cookies
- User context via useSession()

## Security Architecture

### Input Validation
```
Client (Optional)
    ↓
Route Handler
    ├── Parse request body
    ├── Zod schema validation
    └── Type coercion
```

### Authentication
```
Login Request
    ↓
Credentials Provider
    ├── Email/Password lookup
    ├── bcryptjs hash comparison
    └── JWT token generation
        ↓
    Session Cookie (HTTP-only)
```

### Authorization
```
Protected Route Handler
    ├── Check session validity
    ├── Verify user ID
    └── Grant/Deny access
```

### SQL Safety
```
Prisma ORM
    ├── Parameterized queries
    ├── Type safety
    └── No raw SQL injection risk
```

## Data Flow Examples

### Public Project Viewing

```
1. User visits /projects/[slug]
   
2. Server Component fetches:
   GET /api/projects/[slug]
   
3. Route Handler:
   - Parse slug from params
   - Prisma query with relations
   - Return floors + apartments
   
4. Component renders:
   - Project header
   - 3D building scene
   - Apartment grid
   
5. User interaction:
   - Click floor
   - Click apartment
   - View details modal
```

### Apartment Reservation

```
1. User fills reservation form
   - Name, email, phone, message
   - apartmentId, projectId
   
2. Form submission:
   POST /api/reservations
   
3. Route Handler:
   - Validate with Zod schema
   - Create database record
   - Return success/error
   
4. UI Update:
   - Show success toast
   - Close modal
   - Refresh reservations (optional)
```

### Admin Project Creation

```
1. Admin submits form
   - Name, slug, location, etc.
   
2. Authentication check:
   - Verify session token
   - Confirm admin role
   
3. POST /api/projects
   
4. Route Handler:
   - Validate data
   - Create project record
   - Return with ID
   
5. Redirect to projects list
   - Fetch updated list
   - Display new project
```

## Performance Optimization

### Frontend
- Server-side rendering (SSR) for public pages
- Static generation where possible
- Dynamic imports for 3D components
- Image optimization
- CSS-in-JS with Tailwind

### Backend
- Database connection pooling (Prisma)
- Query optimization with relations
- Caching strategies (HTTP headers)
- API response compression

### Database
- Indexed foreign keys
- Strategic relation loading
- Pagination for large datasets
- Efficient filtering queries

## Error Handling

### Global Error Boundaries
```
Route Handler Error
    ↓
Try-Catch Block
    ├── Validation Error (400)
    ├── Auth Error (401/403)
    ├── Not Found (404)
    └── Server Error (500)
        ↓
    JSON Response with Error Message
```

### Client-Side Error Handling
```
API Call
    ├── Success: Update state
    ├── Validation Error: Show form errors
    ├── Auth Error: Redirect to login
    └── Server Error: Show toast notification
```

## Deployment Architecture

### Local Development
```
npm run dev
    ├── Next.js Dev Server (port 3000)
    ├── Prisma with SQLite (optional)
    └── Hot module reloading
```

### Production (Vercel)
```
Git Push
    ↓
Vercel Build
    ├── npm install
    ├── npm run build
    ├── prisma generate
    └── Deploy
        ↓
Vercel Edge Network
    ├── Serverless Functions (/api)
    ├── Static Files (public)
    └── Database Connection
        ↓
    PostgreSQL (External)
```

## Scalability Considerations

### Current Limitations
- Single database connection
- No caching layer
- No real-time updates
- Linear data loading

### Future Improvements
- Redis caching layer
- WebSocket for real-time updates
- Elasticsearch for search
- CDN for static assets
- Horizontal scaling with load balancer

## Testing Strategy

### Unit Tests
- Validation schemas (Zod)
- Utility functions
- Component rendering

### Integration Tests
- API routes with database
- Authentication flows
- Database operations

### E2E Tests
- Full user journeys
- Admin workflows
- Public site navigation

## Monitoring & Logging

### Key Metrics
- API response times
- Database query performance
- Error rates
- User sessions

### Logging
- Console logs (development)
- Cloud logging (production)
- Error tracking (Sentry optional)

## Documentation

- **README.md**: Features and overview
- **SETUP.md**: Installation and configuration
- **ARCHITECTURE.md**: This file - technical details
- **Code comments**: Inline documentation
