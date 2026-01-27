# Real Estate Developer Sales Platform - Multi-Tenant Edition

A production-ready full-stack real estate platform with **multi-tenant architecture**, allowing super admins to create separate dashboard control panels for each real estate developer client.

## 🎯 Key Features

### Multi-Tenant System
- **Super Admin Panel**: Manage all clients and users
- **Client Dashboards**: Each developer gets their own admin panel
- **Team Management**: Clients can invite agents to their account
- **Role-Based Access**: SUPER_ADMIN, OWNER, AGENT roles with permissions

### Public Features
- **Interactive 3D Building View**: Explore buildings with React Three Fiber
- **Projects Listing**: Browse all available projects from all clients
- **Project Details**: View detailed information with interactive floor plans
- **Apartment Filtering**: Filter by status, rooms, price, and area
- **Reservation System**: Submit reservation requests
- **Responsive Design**: Works on desktop and mobile

### Client Dashboard Features
- **Projects Management**: Create, edit, delete their projects
- **Floor Management**: Organize projects by floors
- **Apartment Management**: CRUD operations with bulk create
- **Team Members**: Add agents to help sell properties
- **Sales Analytics**: View reservations and unit status
- **Dashboard Stats**: Overview of their properties and sales

### Super Admin Features
- **Client Management**: Create and manage client accounts
- **User Management**: Create users for clients
- **Global Analytics**: View all projects, reservations, and clients
- **Client Overview**: See all clients with their stats

## 🏗️ Architecture

### Database Schema (Multi-Tenant)
```
Client (Organization)
  ├── Users (Owner, Agents)
  ├── Projects
  │   ├── Floors
  │   │   └── Apartments
  │   └── Reservations
```

### User Roles
- **SUPER_ADMIN**: Full access to all clients, can create clients
- **OWNER**: Can manage own client's projects and team
- **AGENT**: Can view projects but not make changes

## 🔐 Access Levels

| Action | Super Admin | Owner | Agent | Public |
|--------|-------------|-------|-------|--------|
| View all clients | ✓ | ✗ | ✗ | ✗ |
| Create client | ✓ | ✗ | ✗ | ✗ |
| Create project | ✓ | ✓ | ✗ | ✗ |
| Edit project | ✓ | ✓ | ✗ | ✗ |
| Manage team | ✓ | ✓ | ✗ | ✗ |
| View public projects | ✓ | ✓ | ✓ | ✓ |
| Make reservation | ✓ | ✓ | ✓ | ✓ |

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment template
cp .env.example .env.local

# Add your Neon PostgreSQL connection string
DATABASE_URL="postgresql://..."
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Create database schema
npx prisma db push

# Seed with test data
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

Access the app at `http://localhost:3000`

## 📋 Test Accounts

After seeding, use these credentials:

### Super Admin
```
Email: superadmin@example.com
Password: superadmin123
URL: http://localhost:3000/admin/login
```

### Client - Prestige Developers
**Owner:**
```
Email: owner@prestige.com
Password: prestige123
```

**Agent:**
```
Email: agent@prestige.com
Password: prestige123
```

### Client - Modern Living Co
**Owner:**
```
Email: owner@modern.com
Password: modern123
```

## 📱 Client Dashboard Workflow

### For Super Admin
1. Login at `/admin/login`
2. Dashboard shows all clients and global stats
3. Navigate to **Clients** to manage developer accounts
4. Create new client → Creates user credentials
5. View client details, projects, and team members

### For Client Owner
1. Login at `/admin/login`
2. Dashboard shows their projects, units, and reservations
3. **Projects**: Create new projects
4. **Team**: Invite agents to help sell
5. **Settings**: Manage account preferences

### For Public Users
1. Visit homepage `/`
2. Browse all projects from all clients
3. View 3D building visualization
4. Filter apartments
5. Submit reservation request (no login required)

## 🛠️ API Endpoints

### Super Admin APIs
```
POST /api/admin/clients           - Create new client
GET  /api/admin/clients           - List all clients
GET  /api/admin/users             - List all users
POST /api/admin/users             - Create user for client
DELETE /api/admin/users/[id]      - Remove user
```

### Project APIs (Multi-Tenant)
```
GET  /api/projects                - List projects (filters by clientId for logged-in users)
POST /api/projects                - Create project (auto-adds current client)
GET  /api/projects/[slug]         - Get project details
PATCH /api/projects/[id]          - Update project
DELETE /api/projects/[id]         - Delete project
```

### Other APIs
```
GET  /api/projects/[projectId]/floors
POST /api/projects/[projectId]/floors
GET  /api/floors/[floorId]/apartments
POST /api/floors/[floorId]/apartments
PATCH /api/apartments/[id]
DELETE /api/apartments/[id]
POST /api/reservations
```

## 📊 Analytics Dashboard

Each client sees:
- **Total Projects**: Number of active projects
- **Total Apartments**: Total units across projects
- **Available Units**: Ready for sale
- **Reserved**: Under reservation
- **Sold**: Completed sales
- **Reservations**: Incoming requests

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT session tokens with HTTP-only cookies
- Row-level data isolation per client
- SQL injection prevention via Prisma
- Role-based access control
- Email validation

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── clients/          - Client management
│   │   │   └── users/            - User management
│   │   ├── projects/             - Project APIs (multi-tenant)
│   │   ├── floors/               - Floor APIs
│   │   ├── apartments/           - Apartment APIs
│   │   ├── reservations/         - Reservation APIs
│   │   └── auth/                 - NextAuth handler
│   ├── admin/
│   │   ├── dashboard/            - Role-based dashboard
│   │   ├── clients/              - Client management pages
│   │   ├── projects/             - Project management
│   │   ├── team/                 - Team member management
│   │   └── login/                - Authentication
│   ├── projects/                 - Public project pages
│   └── page.tsx                  - Homepage
├── components/
│   ├── 3d/                       - 3D building visualization
│   ├── admin/                    - Admin UI components
│   ├── public/                   - Public pages components
│   └── ui/                       - Shadcn UI components
├── lib/
│   ├── auth.ts                   - NextAuth configuration
│   ├── prisma.ts                 - Prisma client
│   └── validations.ts            - Zod schemas
└── prisma/
    ├── schema.prisma             - Database schema
    └── seed.ts                   - Test data seeding
```

## 🔧 Key Technologies

- **Framework**: Next.js 16+ App Router
- **Frontend**: React 19, TailwindCSS v4, shadcn/ui
- **3D**: Three.js, React Three Fiber, Drei
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 with credentials provider
- **Validation**: Zod
- **Charts**: Recharts
- **UI Components**: Radix UI

## 📝 Adding a New Client

1. **Super Admin Dashboard** → **Clients** → **+ Create Client**
2. Enter client details (name, email, city)
3. Create client's first user (OWNER role)
4. Client can then login and add projects
5. Client can invite agents to help

## 🚀 Deployment

### Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Deploy multi-tenant platform"
git push origin main

# Connect to Vercel
# Vercel auto-deploys on push

# Set environment variables in Vercel Dashboard:
# - DATABASE_URL
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - NEXTAUTH_URL
```

### Database Migration
```bash
# On production:
npx prisma db push
npx prisma db seed  # Optional: seed with test data
```

## 📖 Documentation

See additional docs:
- `SETUP.md` - Detailed setup instructions
- `ARCHITECTURE.md` - System architecture details
- `IMPLEMENTATION.md` - Development guidelines

## 🐛 Troubleshooting

### Login Issues
- Ensure `DATABASE_URL` is set correctly
- Check that Prisma migrations are applied: `npx prisma db push`
- Verify user exists: Check the `users` table

### Project Not Showing
- Ensure project is assigned to logged-in user's `clientId`
- Check that client is ACTIVE status
- Verify user role allows project creation

### 3D Visualization Not Working
- Check browser WebGL support
- Try a different browser (Firefox, Chrome)
- Check browser console for errors

## 📝 License

This project is provided as-is for commercial use.

## 🤝 Support

For issues or questions, refer to the documentation files or check the database schema in `prisma/schema.prisma`.
