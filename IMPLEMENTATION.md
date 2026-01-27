# Implementation Details & Best Practices

## Key Implementation Decisions

### 1. Authentication Strategy

**Decision**: NextAuth v5 with Credentials Provider
- **Rationale**: Secure, lightweight, no external OAuth needed
- **Benefits**: Full control over authentication flow
- **Implementation**: 
  - Credentials provider with email/password
  - bcryptjs for password hashing
  - JWT sessions for stateless authentication
  - HTTP-only cookies for security

```typescript
// Key files:
/lib/auth.ts                    # NextAuth configuration
/app/admin/login/page.tsx       # Login page
/app/api/auth/[auth0]/route.ts # Auth handler
```

### 2. Database Layer

**Decision**: Prisma ORM with PostgreSQL
- **Rationale**: Type safety, migrations, excellent DX
- **Benefits**: 
  - Automatic migrations
  - Type generation
  - Query optimization
  - Seed scripts

```prisma
// Key files:
/prisma/schema.prisma          # Database schema
/prisma/seed.ts                # Seed data
/lib/prisma.ts                 # Client singleton
```

### 3. 3D Visualization

**Decision**: React Three Fiber + Drei
- **Rationale**: React-first 3D graphics library
- **Benefits**:
  - Component-based 3D
  - Easy React integration
  - Good documentation
  - Community support

```typescript
// Key files:
/components/3d/building-scene.tsx    # 3D building component
```

**Features Implemented**:
- Interactive floor selection
- Color-coded apartment status
- Hover effects
- Auto-camera transitions
- 2D fallback for unsupported browsers

### 4. Form Handling

**Decision**: React Hook Form + Zod
- **Rationale**: Lightweight, performant, type-safe
- **Benefits**:
  - No re-renders on every keystroke
  - Built-in validation
  - TypeScript support
  - Minimal bundle size

```typescript
// Key files:
/lib/validations.ts            # Zod schemas
/components/public/reservation-form.tsx
```

## Architecture Patterns

### Server-Client Data Flow

#### Public Pages (SSR)
```typescript
// /app/projects/[slug]/page.tsx
async function getProject(slug: string) {
  const project = await prisma.project.findUnique(...)
  // Direct database access - no API call needed
}

export default function ProjectPage({ project }) {
  // Client component with hydrated data
  const [selectedFloor, setSelectedFloor] = useState(...)
  return <BuildingScene floors={project.floors} ... />
}
```

#### Admin Pages (Protected)
```typescript
// /app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')
  return <ProtectedLayout>{children}</ProtectedLayout>
}
```

#### API Routes (Validation & Auth)
```typescript
// /app/api/projects/route.ts
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return unauthorized()
  
  const data = projectSchema.parse(await request.json())
  const project = await prisma.project.create({ data })
  return NextResponse.json(project, { status: 201 })
}
```

### Error Handling Pattern

```typescript
try {
  // Perform operation
  const result = await prisma.project.create(...)
  return NextResponse.json(result)
} catch (error) {
  console.error('[Route]', error)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}
```

### Component Composition

#### Client Component with Data
```typescript
'use client'
export default function ProjectList() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(setProjects)
  }, [])
  
  return <div>{projects.map(...)}</div>
}
```

#### Server Component with Data
```typescript
// No 'use client' - runs on server
export default async function ProjectList() {
  const projects = await prisma.project.findMany()
  return <div>{projects.map(...)}</div>
}
```

## Performance Considerations

### Database Query Optimization

**Problem**: N+1 queries
```typescript
// ❌ Bad: 1 + N queries
const projects = await prisma.project.findMany()
projects.forEach(async (p) => {
  const floors = await prisma.floor.findMany({ where: { projectId: p.id } })
})

// ✅ Good: Single query with relations
const projects = await prisma.project.findMany({
  include: {
    floors: {
      include: { apartments: true }
    }
  }
})
```

### Component Rendering Optimization

```typescript
// Memoize expensive components
export const FloorMesh = memo(({ floor, isSelected }) => {
  // Only re-renders if props change
  return <mesh {...props} />
})
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/project.jpg"
  alt="Project"
  width={400}
  height={300}
  priority={false}
/>
```

## Security Implementation

### Password Hashing

```typescript
// In seed.ts - Create admin user
const hashedPassword = await bcrypt.hash('admin123', 10)
await prisma.adminUser.create({
  data: { email: 'admin@example.com', password: hashedPassword }
})

// In auth.ts - Verify password
const isValid = await bcrypt.compare(inputPassword, user.password)
```

### Input Validation

```typescript
// All inputs validated server-side with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  projectId: z.string().cuid(),
})

const data = schema.parse(input) // Throws if invalid
```

### Protected Routes

```typescript
// Middleware pattern
export async function GET(request) {
  const session = await auth()
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Proceed with protected operation
}
```

## Data Validation Layers

### Client-Side (UX)
- Form validation with React Hook Form
- Real-time error display
- User feedback

### Server-Side (Security)
```typescript
// Zod validation
const projectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  floorsCount: z.number().int().min(1),
})

// Type inference
type ProjectInput = z.infer<typeof projectSchema>
```

### Database Level
- Type checking with Prisma
- Foreign key constraints
- Unique indexes on slug

## Testing Checklist

### Unit Tests
- [ ] Validation schemas (Zod)
- [ ] Utility functions
- [ ] Component rendering

### Integration Tests
- [ ] API routes with database
- [ ] Authentication flow
- [ ] CRUD operations

### E2E Tests
- [ ] Public project browsing
- [ ] 3D building interaction
- [ ] Apartment filtering
- [ ] Reservation submission
- [ ] Admin login
- [ ] Project creation
- [ ] Apartment status updates

## Common Development Tasks

### Adding a New Feature

1. **Database Changes**
   ```prisma
   // Add field to schema
   model Apartment {
     ...
     featured Boolean @default(false)
   }
   ```
   ```bash
   npx prisma migrate dev --name "add_featured_to_apartment"
   ```

2. **API Endpoint**
   ```typescript
   // /app/api/apartments/[id]/route.ts
   export async function PATCH(request, { params }) {
     const data = apartmentSchema.parse(await request.json())
     const apartment = await prisma.apartment.update({
       where: { id: params.id },
       data
     })
     return NextResponse.json(apartment)
   }
   ```

3. **UI Component**
   ```typescript
   // /components/public/apartment-card.tsx
   export default function ApartmentCard({ apartment }) {
     return (
       <Card>
         {apartment.featured && <Badge>Featured</Badge>}
         // ... rest of component
       </Card>
     )
   }
   ```

4. **Testing**
   - Test in admin interface
   - Verify API response
   - Check UI rendering
   - Test with various data

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name "describe_change"

# Check migration history
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset

# Deploy migration (production)
npx prisma migrate deploy
```

### Debugging

```typescript
// Enable Prisma logging
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// console.log debugging
console.log('[ComponentName]', variable)

// React DevTools
// - Check component props
// - Trace re-renders
// - Inspect state

// Network tab
// - Check API requests/responses
// - Verify status codes
// - Check headers
```

## Environment Variables

### Development (.env.local)
```env
DATABASE_URL="postgresql://localhost:5432/real_estate_dev"
NEXTAUTH_SECRET="dev-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (Vercel Dashboard)
```env
DATABASE_URL="postgresql://prod-user:pass@prod-host/real_estate"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

### Never commit
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- API keys
- Database credentials

## Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Configure database connection string
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed production data if needed
- [ ] Test login flow
- [ ] Verify API endpoints
- [ ] Check 3D visualization on production
- [ ] Set up error tracking (Sentry)
- [ ] Configure backups
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts

## Performance Tips

### For Large Datasets
```typescript
// Add pagination
export async function GET(request) {
  const page = request.nextUrl.searchParams.get('page') || '1'
  const skip = (parseInt(page) - 1) * 10
  
  const apartments = await prisma.apartment.findMany({
    skip,
    take: 10,
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json(apartments)
}
```

### For Complex Queries
```typescript
// Use raw SQL only when necessary
const result = await prisma.$queryRaw`
  SELECT * FROM Apartment WHERE projectId = ${projectId}
`
```

### Caching
```typescript
// Browser caching
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600'
  }
})
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies: `npm update`
- [ ] Check for security issues: `npm audit`
- [ ] Review error logs
- [ ] Backup database
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Database Maintenance
```bash
# Analyze query performance
EXPLAIN ANALYZE SELECT ...

# Optimize indexes
CREATE INDEX idx_project_slug ON Project(slug)

# Vacuum and analyze
VACUUM ANALYZE
```

## Resources

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NextAuth Security](https://next-auth.js.org/providers/credentials)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#caching)
- [PostgreSQL Optimization](https://www.postgresql.org/docs/current/performance-tips.html)
