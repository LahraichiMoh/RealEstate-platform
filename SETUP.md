# Real Estate Platform - Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database running (local or cloud)
- npm or yarn package manager

### 2. Environment Setup

Create `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/real_estate_platform"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -hex 32
```

Or use Node:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Database Setup

**Initialize Prisma and create database:**
```bash
# Push schema to database
npx prisma db push

# Seed database with sample data
npx prisma db seed
```

This will:
- Create all necessary tables
- Create an admin user: `admin@example.com` / `admin123`
- Populate sample project with 10 floors and 60 apartments

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Accessing the Platform

### Public Website
- **Home**: http://localhost:3000
- **Projects Listing**: http://localhost:3000/projects
- **Project Details**: http://localhost:3000/projects/luxury-residences-downtown

### Admin Dashboard
- **Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin
- **Manage Projects**: http://localhost:3000/admin/projects

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## Database Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Push schema changes to database
npm run db:push

# Seed database with initial data
npm run db:seed

# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name "description"
```

## Project Structure

```
real-estate-platform/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes (Next.js Route Handlers)
│   ├── admin/                   # Admin dashboard pages
│   ├── projects/                # Public project pages
│   └── layout.tsx, page.tsx      # Root layout and home page
├── components/
│   ├── admin/                   # Admin-specific components
│   ├── public/                  # Public-facing components
│   ├── 3d/                      # 3D visualization components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── validations.ts           # Zod validation schemas
│   └── admin-middleware.ts      # Admin protection middleware
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed data script
└── public/                      # Static assets
```

## API Endpoints Reference

### Projects
```
GET    /api/projects              - List all projects
POST   /api/projects              - Create new project (admin)
GET    /api/projects/[slug]       - Get project details
PATCH  /api/projects/[slug]       - Update project (admin)
DELETE /api/projects/[slug]       - Delete project (admin)
```

### Floors
```
GET    /api/projects/[id]/floors  - List floors in project
POST   /api/projects/[id]/floors  - Create floor (admin)
```

### Apartments
```
GET    /api/floors/[id]/apartments       - List apartments on floor
POST   /api/floors/[id]/apartments       - Create apartment (admin)
PATCH  /api/apartments/[id]              - Update apartment (admin)
DELETE /api/apartments/[id]              - Delete apartment (admin)
```

### Reservations
```
POST   /api/reservations          - Create reservation request
GET    /api/reservations          - List requests (admin)
```

## Features Overview

### Public Features
- Browse real estate projects
- View interactive 3D building models
- Filter apartments by status, price, rooms, and area
- Submit reservation requests
- Responsive mobile design

### Admin Features
- Secure login with email/password
- Create and manage projects
- Manage floors within projects
- CRUD operations for apartments
- Quick status updates (Available/Reserved/Sold)
- View all reservation requests

## 3D Building Features

- **Interactive 3D Scene**: Built with Three.js and React Three Fiber
- **Floor Selection**: Click floors to zoom and view apartments
- **Status Visualization**: Color-coded apartments (Green=Available, Amber=Reserved, Red=Sold)
- **Hover Effects**: Visual feedback on interaction
- **Fallback View**: 2D list view if WebGL unavailable

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Your generated secret key
   - `NEXTAUTH_URL` - Your production domain

4. Deploy!

```bash
vercel deploy
```

## Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Ensure database exists

### "Table doesn't exist" Error
**Solution:**
```bash
npx prisma db push
```

### NextAuth Issues
- Clear cookies: Open DevTools → Application → Cookies → Delete all
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your domain

### 3D View Not Loading
- Check browser supports WebGL
- Verify no console errors
- Try refreshing page
- Try 2D fallback view

## Development Tips

### Run Prisma Studio
Open an interactive database browser:
```bash
npm run db:studio
```

### Generate New Migration
```bash
npx prisma migrate dev --name "add_field"
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong `NEXTAUTH_SECRET` for production
- Always use HTTPS in production
- Keep dependencies updated: `npm audit`
- Use environment variables for sensitive data
- Validate all user input on server-side

## Next Steps

1. Customize branding (colors, fonts, logo)
2. Add email notifications for reservations
3. Implement payment processing
4. Add image gallery for projects
5. Set up analytics and monitoring
6. Configure email service for admin notifications

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## Questions?

Refer to the main README.md for more detailed information about features and architecture.
