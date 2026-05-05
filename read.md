# Time-Tracking SaaS Application

Architect and implement a full-stack time-tracking SaaS application with invite-based onboarding, role-based dashboards (Admin/Employee), and manual timer functionality. The application will be built using Next.js (App Router), Tailwind CSS, Prisma (PostgreSQL), NextAuth for authentication, and an email service provider for invitations.

## User Review Required

> [!IMPORTANT]
> Please review the chosen tech stack and confirm if it aligns with your expectations:
>
> - **Framework**: Next.js (App Router)
> - **Styling**: Tailwind CSS
> - **Database**: PostgreSQL with Prisma ORM
> - **Authentication**: NextAuth.js (Auth.js)
> - **Email Service**: Resend (recommended for Next.js) or Nodemailer (if using SMTP)
> - **State Management**: Zustand (lighter and easier for timers than Redux)

> [!WARNING]
> Since we are starting from scratch in this directory, I will initialize a new Next.js project. We will also need your database connection URL (e.g., from Neon, Supabase, or a local Postgres instance) to connect Prisma.

## Open Questions

1. **Database Connection**: Do you already have a PostgreSQL connection string ready for this project?
2. **Email Provider**: Do you want to use Resend (requires an API key) or Nodemailer (requires SMTP credentials)? During development, we can also just log the invite link to the console.
3. **UI/UX**: Do you prefer a specific aesthetic (e.g., dark mode by default, specific brand colors)?

## Proposed Changes

---

### 1. Project Setup & Configuration

Initialize the Next.js project with Tailwind CSS, TypeScript, and required dependencies.

#### [NEW] package.json

#### [NEW] next.config.mjs

#### [NEW] tailwind.config.ts

---

### 2. Database & ORM (Prisma)

Set up Prisma and define the `User`, `Invitation`, and `TimeLog` models as requested.

#### [NEW] prisma/schema.prisma

#### [NEW] src/lib/db.ts

---

### 3. Authentication & State Management

Configure NextAuth.js for secure session management and set up Zustand for the active timer state.

#### [NEW] src/lib/auth.ts

#### [NEW] src/store/useTimerStore.ts

---

### 4. Backend API Routes (Next.js App Router)

Implement the core backend logic for invites, authentication, and time tracking.

#### [NEW] src/app/api/auth/[...nextauth]/route.ts

#### [NEW] src/app/api/invite/route.ts

#### [NEW] src/app/api/invite/accept/route.ts

#### [NEW] src/app/api/time/start/route.ts

#### [NEW] src/app/api/time/stop/route.ts

#### [NEW] src/app/api/time/logs/route.ts

---

### 5. Frontend UI & Routing

Build the user interfaces using modern, dynamic design principles.

#### [NEW] src/app/(auth)/login/page.tsx

#### [NEW] src/app/(auth)/accept-invite/page.tsx

#### [NEW] src/app/dashboard/admin/page.tsx

#### [NEW] src/app/dashboard/employee/page.tsx

#### [NEW] src/components/Timer.tsx

#### [NEW] src/components/ActivityList.tsx

#### [NEW] src/components/Navbar.tsx

## Verification Plan

### Manual Verification

- **Project Init**: Run `npm run dev` and ensure the Next.js starter loads.
- **Database**: Run Prisma migrations and verify tables are created in PostgreSQL.
- **Invite Flow**: Log in as Admin, create an invite, copy the token, and accept it as a new Employee.
- **Timer Flow**: As an Employee, start the timer, stop it, and verify the correct duration is saved in the database and displayed in the Activity List.
- **Security**: Attempt to access Admin routes as an Employee and verify access is denied.
