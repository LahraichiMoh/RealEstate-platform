# Multi-Tenant Platform - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install & Setup
```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### 2. Access the Platform

**Public Site**
```
http://localhost:3000
- Browse projects from all clients
- View 3D buildings
- Submit reservations (no login needed)
```

**Admin Login**
```
http://localhost:3000/admin/login
```

## 🔐 Test Logins

### Super Admin (Create clients)
```
Email: superadmin@example.com
Password: superadmin123
```

### Client Owner (Manage projects)
```
Email: owner@prestige.com
Password: prestige123
```

### Agent (View projects)
```
Email: agent@prestige.com
Password: prestige123
```

## 🎯 What to Try

### As Super Admin

1. **Login** → `/admin/dashboard` (Super Admin Dashboard)
2. **View Clients** → `/admin/clients` (see all 3 test clients)
3. **Create New Client** → `/admin/clients/new`
   - Fill form with company details
   - Creates client account + owner user
4. **Manage Clients** → Click client name to see:
   - Their projects
   - Their team members
   - Add new users

### As Client Owner

1. **Login** → `/admin/dashboard` (Client Dashboard)
2. **View Your Stats** → See your projects and units
3. **Create Project** → `/admin/projects/new`
   - Add name, location, slug
   - Auto-adds to your client
4. **Add Team Member** → `/admin/team` → `+ Add Team Member`
   - Create AGENT account
   - Agent can view (read-only)
5. **View Public Site** → `/projects`
   - See your projects publicly

### As Public User

1. Go to **Homepage** → `/`
2. Click **Projects** → `/projects`
3. Browse all projects from all clients
4. Click a project → `/projects/[slug]`
   - View 3D building
   - Filter apartments
   - Click apartment → View details
   - Submit reservation → No login needed!

## 📊 Key Features

### Multi-Tenant Isolation
✅ Each client sees only their own projects
✅ Projects don't share slugs (each client can have "Luxury Homes")
✅ Team members can only see their client's data
✅ All data in database is isolated by `clientId`

### Role-Based Access
✅ **SUPER_ADMIN** - Create clients, manage all users
✅ **OWNER** - Create projects, manage team, view analytics
✅ **AGENT** - View projects (read-only)
✅ **PUBLIC** - View projects, make reservations (no login)

### 3D Visualization
✅ Click floors to navigate
✅ Apartments color-coded: Green (Available), Amber (Reserved), Red (Sold)
✅ Hover for apartment details
✅ Works on desktop and mobile

## 🚀 Common Tasks

### Create a New Client

```
Super Admin Login
→ /admin/clients
→ + Create Client
→ Fill form
→ Create owner user
→ Done!
```

### Client Creates a Project

```
Client Owner Login
→ /admin/projects
→ + New Project
→ Fill form (slug auto-filtered to unique per client)
→ Create floors and apartments
→ Project visible in public site
```

### Client Invites Agent

```
Client Owner Login
→ /admin/team
→ + Add Team Member
→ Email: agent@company.com
→ Password: [set]
→ Role: AGENT
→ Done!
```

### Make a Reservation

```
Public user (no login)
→ Browse projects
→ Select apartment
→ Click "Reserve"
→ Fill form (name, email, phone)
→ Submit
→ Client receives notification
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database structure (Client, User, Project, etc) |
| `prisma/seed.ts` | Test data (3 clients, 10 users, projects) |
| `lib/auth.ts` | NextAuth configuration (multi-tenant support) |
| `app/admin/dashboard/page.tsx` | Role-based dashboard |
| `app/api/admin/clients/route.ts` | Super admin client management |
| `app/api/admin/users/route.ts` | User management API |
| `app/api/projects/route.ts` | Multi-tenant project API |

## 🔧 Database

### View Data
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
# Browse: Clients, Users, Projects, Apartments, etc
```

### Reset Database
```bash
npx prisma migrate reset
# Deletes everything and re-seeds
```

### View Schema
```bash
cat prisma/schema.prisma
```

## 📚 Documentation

- **Full Details** → `README.md`
- **Multi-Tenant Guide** → `MULTI_TENANT_GUIDE.md`
- **Implementation** → `MULTI_TENANT_IMPLEMENTATION.md`
- **Architecture** → `ARCHITECTURE.md`

## ⚠️ Important: Data Isolation

Every API filters by `clientId`:

```javascript
// ALWAYS filters by user's clientId
GET /api/projects
→ Returns only YOUR client's projects

// ALWAYS verifies ownership
POST /api/projects/[id]
→ Checks if project belongs to YOUR client

// ALWAYS adds your clientId
POST /api/projects
→ Auto-adds clientId from session
→ You can't assign to other clients
```

## 🐛 Troubleshooting

### Can't Login
```
Check:
  1. Database seeded: npx prisma db seed
  2. Email/password correct (check QUICK_START.md)
  3. Clear browser cookies
  4. Try incognito window
```

### Projects Not Showing
```
Check:
  1. You're logged in
  2. Refresh page (F5)
  3. Check `/admin/projects` vs `/projects`
  4. Admin-only projects don't show publicly
```

### 3D Building Not Working
```
Try:
  1. Different browser (Firefox, Chrome)
  2. Refresh page (Ctrl+Shift+R)
  3. Check browser console for errors
  4. Modern browser required (WebGL)
```

### Password Issues
```
Reset in database:
  npx prisma studio
  → Users table
  → Find your user
  → Reset password field
  → Or re-seed: npx prisma migrate reset
```

## 📞 Need Help?

1. **Can't login?** → Check Troubleshooting above
2. **Need new client?** → Super Admin → /admin/clients
3. **Database issue?** → Run `npx prisma migrate reset`
4. **Read docs** → MULTI_TENANT_GUIDE.md

## 🎉 You're Ready!

Your multi-tenant real estate platform is ready to use!

**Next Steps:**
1. ✅ Try logging in as different roles
2. ✅ Create a test client
3. ✅ Create projects as client
4. ✅ Invite an agent
5. ✅ Browse public site
6. ✅ Submit test reservation

Happy selling! 🏠
