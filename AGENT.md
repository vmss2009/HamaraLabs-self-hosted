# HamaraLabs Self-Hosted Admin Portal

## Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - Build for production
- **Lint**: `npm run lint` - Run ESLint
- **Database**: `npx prisma generate` - Generate Prisma client, `npx prisma migrate dev` - Run migrations
- **Prisma Studio**: `npx prisma studio` - Database GUI

## Architecture
- **Framework**: Next.js 15 with App Router, TypeScript, TailwindCSS
- **Database**: PostgreSQL with Prisma ORM (see prisma/schema.prisma)
- **Auth**: NextAuth.js with Authentik provider, HMAC verification for API routes
- **UI**: Material-UI (MUI) + custom Tailwind components in /components
- **API**: REST endpoints in /app/api with comprehensive CRUD operations

## Code Style
- **Imports**: Use `@/` alias for internal imports
- **Components**: Use React.forwardRef, displayName, TypeScript interfaces
- **Styling**: class-variance-authority (cva) for component variants, cn() utility for conditional classes
- **Forms**: Custom form components with validation, controlled inputs with setvalue prop
- **File Structure**: App router pattern, protected routes in /app/protected, API routes in /app/api
- **Error Handling**: Return Response objects with proper status codes
- **Authentication**: Middleware handles auth redirects and HMAC verification
