# TimeTracker SaaS

A full-stack time-tracking SaaS application with invite-based onboarding, role-based dashboards (Admin / Employee), and a manual timer.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM (driver adapter)
- **Authentication**: NextAuth.js (credentials provider, JWT sessions)
- **Email**: Resend (optional — invite links are logged to the console when not configured)
- **State Management**: Zustand

## Prerequisites

- Node.js 18+
- A PostgreSQL database

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable          | Description                                                        |
   | ----------------- | ------------------------------------------------------------------ |
   | `DATABASE_URL`    | PostgreSQL connection string (used by Prisma and migrations)        |
   | `NEXTAUTH_SECRET` | Secret for signing JWTs — generate with `openssl rand -base64 32`   |
   | `NEXTAUTH_URL`    | Canonical app URL (e.g. `http://localhost:3000`)                    |
   | `RESEND_API_KEY`  | Resend API key for invite emails — leave default to skip sending    |

3. **Apply database migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Seed a default admin account**

   ```bash
   npx prisma db seed
   ```

   This creates an admin: `admin@example.com` / `admin123`.

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Usage

- **Admin** signs in and invites users from the Admin Dashboard. If Resend is not
  configured, the invite link is shown in the UI and logged to the server console.
- **Invited users** open the invite link, set their name and password, then sign in.
- **Employees** use the timer on their dashboard to track sessions, optionally adding
  a note, and review past activity in the activity list.

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Run the production build     |
| `npm run lint`  | Run ESLint                   |
