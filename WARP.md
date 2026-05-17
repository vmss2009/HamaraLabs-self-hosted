# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

HamaraLabs is an education technology platform for automating experiential learning in Atal Tinkering Labs (ATLs) and schools. This is the self-hosted admin portal that manages students, schools, tinkering activities, competitions, courses, and mentors across the ATL ecosystem.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma migrate dev --name <migration_name>` - Create and apply new migration
- `npx prisma migrate dev` - Apply pending migrations
- `npx prisma studio` - Open Prisma Studio database GUI
- `npx prisma db push` - Push schema changes to database (dev only)
- `npx prisma db seed` - Run database seeding scripts

### Testing and Debugging
- No test framework is currently configured
- Use `npx prisma studio` to inspect database state
- Check `.next/` directory for build artifacts and debugging

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Material-UI (MUI) components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Authentik (self-hosted OIDC provider)
- **Deployment**: Docker-ready with compose configuration

### Directory Structure
```
app/
├── (auth)/           # Auth-related routes (sign-in, etc.)
├── api/             # API routes for CRUD operations
│   ├── auth/        # NextAuth.js endpoints
│   ├── schools/     # School management endpoints
│   ├── students/    # Student management endpoints
│   ├── mentors/     # Mentor management endpoints
│   ├── competitions/ # Competition management endpoints
│   ├── courses/     # Course management endpoints
│   ├── tinkering-activities/ # Activity management endpoints
│   ├── customised-*/ # Personalized content endpoints
│   └── ...          # Geography and other API endpoints
├── protected/       # Protected application routes
│   ├── cluster/     # School cluster management
│   │   ├── form/    # Cluster creation/edit forms
│   │   └── report/  # Cluster reporting dashboard
│   ├── school/      # School management
│   │   ├── form/    # School creation/edit forms
│   │   └── report/  # School reporting dashboard
│   ├── student/     # Student management
│   │   ├── form/    # Student creation/edit forms
│   │   └── report/  # Student reporting dashboard
│   ├── mentor/      # Mentor management
│   │   ├── form/    # Mentor creation/edit forms
│   │   └── report/  # Mentor reporting dashboard
│   ├── competition/ # Competition management
│   │   ├── form/    # Competition creation/edit forms
│   │   └── report/  # Competition reporting dashboard
│   ├── course/      # Course management
│   │   ├── form/    # Course creation/edit forms
│   │   └── report/  # Course reporting dashboard
│   ├── tinkering-activity/ # Tinkering activity management
│   │   ├── form/    # Activity creation/edit forms
│   │   └── report/  # Activity reporting dashboard
│   ├── student-snapshot/ # Student progress tracking
│   │   ├── competition/ # Student competition assignments
│   │   ├── course/  # Student course enrollments
│   │   └── tinkering-activity/ # Student activity progress
│   ├── school-visits/ # School visit management
│   │   └── form/    # Visit form creation
│   └── sarthi/      # Sarthi (field coordinator) functions
│       └── school-visits/ # School visit tracking and reports
├── globals.css      # Global styles
├── layout.tsx       # Root layout component
└── page.tsx         # Home page

components/          # Reusable UI components
├── Button.tsx       # Custom button component
├── Card.tsx         # Card component
├── FormSection.tsx  # Form layout component
├── Multiform.tsx    # Multi-step form component
├── Select.tsx       # Custom select component
├── DialogBox.tsx    # Dialog/modal component
├── DetailViewer.tsx # Data display component
├── DynamicFieldArray.tsx # Dynamic form field management
└── ...              # Other form and UI components

lib/
├── auth/           # Authentication configuration
├── db/             # Database operations organized by entity
│   ├── school/     # School CRUD operations and types
│   ├── student/    # Student CRUD operations and types
│   ├── mentor/     # Mentor CRUD operations and types
│   ├── competition/ # Competition CRUD operations and types
│   ├── course/     # Course CRUD operations and types
│   ├── tinkering-activity/ # Activity CRUD operations and types
│   ├── customised-*/ # Personalized content operations
│   ├── location/   # Geographic data operations
│   ├── cluster/    # School cluster operations
│   └── school-visits/ # School visit operations
└── utils.ts        # Utility functions

prisma/
├── schema.prisma   # Database schema
└── migrations/     # Database migrations
```

### Database Schema Architecture
The database follows an educational management system pattern:

**Core Entities:**
- `User` - System users (teachers, admins, students)
- `School` - Educational institutions (ATL and non-ATL schools)
- `Student` - Individual students with aspirations and class details

**Content Management:**
- `Subject` → `Topic` → `Subtopic` hierarchy for organizing content
- `TinkeringActivity` - Base activities linked to subtopics
- `CustomisedTinkeringActivity` - Student-specific activity instances
- `Competition` - External competitions and hackathons
- `Course` - Educational courses and programs

**Geography:**
- `Country` → `State` → `City` → `Address` hierarchy for location management

**Customization Layer:**
- `CustomisedCompetition` - Student-specific competition tracking
- `CustomisedCourse` - Student-specific course enrollment

### Authentication Flow
1. Authentik OIDC provider handles user authentication
2. NextAuth.js manages sessions and tokens
3. Middleware (`middleware.ts`) enforces route protection
4. API routes use HMAC verification for security
5. Protected routes are under `/app/protected/`

### API Design Patterns
- RESTful endpoints in `/app/api/`
- CRUD operations for each entity
- Dynamic routes using `[id]` folders
- Consistent Response objects with proper status codes
- HMAC-based request verification for sensitive operations

### Component Architecture
- **Material-UI Integration**: Primary UI component library
- **Custom Components**: Built on top of MUI with TailwindCSS styling
- **Form Management**: Custom form components with validation
- **Class Variance Authority (CVA)**: Component variant management
- **Conditional Styling**: `cn()` utility function for dynamic classes

### Import Conventions
- Use `@/` alias for all internal imports
- Example: `import { Button } from '@/components/Button'`

### Environment Setup
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application base URL
- `AUTHENTIK_CLIENT_ID` - Authentik OAuth client ID
- `AUTHENTIK_CLIENT_SECRET` - Authentik OAuth client secret
- `AUTHENTIK_URL` - Authentik server URL
- `AUTHENTIK_ISSUER` - Authentik OIDC issuer URL
- `NEXTAUTH_SECRET` - NextAuth.js encryption secret
- `AUTH_TRUST_HOST` - Trust host for authentication

### Development Workflow
1. Authentik and PostgreSQL must be running in Docker
2. Copy `.env.example` to `.env` and configure
3. Run `npm install` to install dependencies
4. Run `npx prisma migrate dev --name first_migration` for initial setup
5. Run `npx prisma generate` to generate client
6. Start development with `npm run dev`

### Application Modules

The application is organized into distinct functional modules, each with dedicated form and report interfaces:

**Core Entity Management:**
- **School Module**: Complete school lifecycle management (ATL and non-ATL schools)
- **Student Module**: Student registration, profile management, and progress tracking
- **Mentor Module**: Mentor onboarding, assignment, and performance tracking
- **Cluster Module**: School grouping and hub-spoke relationship management

**Content Management:**
- **Competition Module**: External competition discovery, assignment, and milestone tracking
- **Course Module**: Educational course catalog and enrollment management
- **Tinkering Activity Module**: Hands-on activity creation and customization

**Operational Management:**
- **School Visits Module**: Field visit scheduling, documentation, and reporting
- **Student Snapshot Module**: Comprehensive student progress visualization across all activities
- **Sarthi Module**: Field coordinator tools for managing multiple school operations

**Customization & AI Layer:**
- **Customised Activities**: AI-driven personalization of tinkering activities per student
- **Customised Competitions**: Student-specific competition recommendations and tracking
- **Customised Courses**: Personalized learning path assignments

### Key Business Logic
- **ATL Management**: Core functionality for Atal Tinkering Lab operations
- **Student Journey**: Track student progress through activities and competitions
- **Multi-tenancy**: Support for multiple schools and user roles
- **Customization Engine**: AI-driven assignment of activities to students
- **Hub-Spoke Model**: Schools can be connected in hub-spoke relationships
- **Form-Report Pattern**: Each entity follows a consistent form (CRUD) and report (dashboard) pattern
- **Hierarchical Data**: Geographic (Country→State→City→Address) and educational (Subject→Topic→Subtopic) hierarchies

### Code Style Guidelines
- **Components**: Use React.forwardRef and displayName for better debugging
- **TypeScript**: Define interfaces for all component props
- **Error Handling**: Return Response objects with appropriate HTTP status codes
- **Database Queries**: Use Prisma client with proper error handling
- **Form Handling**: Controlled components with setValue prop pattern

## Development Notes

### Common Patterns
- Protected routes require authentication middleware
- Form components follow a consistent validation pattern
- Database operations use transaction handling where appropriate
- Components are designed for reusability across different entities

### Performance Considerations
- Next.js App Router with automatic code splitting
- Prisma ORM with optimized queries
- Material-UI with tree shaking
- TailwindCSS with purging for minimal bundle size

### Security Implementation
- HMAC verification for API routes
- NextAuth.js session management
- Authentik as external identity provider
- Environment-based configuration for secrets