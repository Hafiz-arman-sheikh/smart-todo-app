# Orbit — Smart To-Do Management

A responsive, multi-user task manager built with React, TypeScript, Vite, Tailwind CSS, Supabase Auth/Postgres, and Recharts. The project intentionally uses straightforward React components and hooks so it is approachable for beginner-to-intermediate developers.

## Features

- Email/password signup and login, Google OAuth, password reset, persistent Supabase sessions, and protected routes.
- User profile name and password updates.
- Create, read, update, delete, and complete/reopen tasks.
- Categories, four priority levels, three task statuses, due date and time.
- Search, status/priority/category filters, sorting, and grid/list display.
- Dashboard statistics and analytics calculated from the signed-in user's actual task rows.
- Responsive dark SaaS interface, loading states, empty/error states, and toast feedback.
- Database Row Level Security policies ensure users can only access their own tasks.

## Technology

React 19, TypeScript 5, Vite 7, Tailwind CSS 4 (Vite plugin), React Router, Supabase JS, React Hook Form, Zod, Framer Motion, Lucide React, Recharts, Sonner, and date-fns.

## Folder structure

```text
src/
├── App.tsx, App.css, main.tsx, index.css
├── pages/
│   ├── Login/Login.tsx + Login.css
│   ├── Signup/Signup.tsx + Signup.css
│   └── Dashboard/Dashboard.tsx + Dashboard.css
├── components/ (Sidebar, Header, TaskCard, TaskModal)
├── context/AuthContext.tsx
├── hooks/useTasks.ts
├── lib/supabase.ts
└── types/task.ts
supabase/schema.sql
.env.example
```

## 1. Install and run

Install Node.js 20.19+ (or 22.12+) and npm. In the project folder:

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, create `.env` by copying `.env.example` in File Explorer or run `Copy-Item .env.example .env`.

## 2. Create and configure Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Open **Project Settings → API** (or **Data API**) and copy the Project URL and the publishable/anon client key.
3. Paste them into `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

4. Never put a service-role key, database password, or secret key in a `VITE_` variable. The browser uses only the publishable/anon key; RLS is the security boundary.
5. Restart `npm run dev` after editing `.env`.

## 3. Create the database and security policies

1. In Supabase, open **SQL Editor → New query**.
2. Copy all of `supabase/schema.sql` into the editor and run it.
3. Confirm that `public.tasks` exists and RLS is enabled. The SQL creates SELECT, INSERT, UPDATE, and DELETE policies tied to `auth.uid()` and indexes for common user/task lookups.
4. Do not disable RLS in production. Do not expose service-role credentials in the browser.

The `user_id` column defaults to `auth.uid()`. The frontend does not submit a user ID when creating a task. RLS independently checks ownership on every database request.

## 4. Configure email/password authentication

In Supabase **Authentication → Providers → Email**, enable email/password sign-in. Under **Authentication → URL Configuration**, set:

- Site URL: `http://localhost:5173` during local development.
- Redirect URLs: `http://localhost:5173/**` and your deployed site URL (for example `https://your-domain.com/**`).

Email confirmation can remain enabled. When it is enabled, signup may return without a session; Orbit displays a message asking the user to verify their email rather than navigating as an authenticated user. For local development/testing only, you can turn off **Confirm email** under the Email provider settings to test multiple accounts without inbox verification. Re-enable it before a real public launch if verification is part of your desired signup policy.

Password reset uses Supabase's reset email and redirects to `/login`. Configure your production URL in the allowed redirect URLs too.

## 5. Configure Google OAuth

1. In Google Cloud Console, create/select a project and configure the OAuth consent screen.
2. Create an OAuth client ID of type **Web application**.
3. In Supabase **Authentication → Providers → Google**, enable Google and paste the Google client ID and client secret.
4. Copy the Supabase callback URL shown on that provider screen into Google Cloud's **Authorized redirect URIs**. It usually looks like `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`.
5. Add your local and production app origins to Google's **Authorized JavaScript origins** (for example `http://localhost:5173` and `https://your-domain.com`).
6. Save settings. Add the app's `/dashboard` URL to Supabase's allowed redirect URLs.

The app starts the OAuth flow through Supabase and returns to `/dashboard`.

## 6. Development checks

```bash
npm run typecheck
npm run build
npm run preview
```

A successful frontend build does not prove that external Supabase credentials, email delivery, Google OAuth, or live database policies are configured correctly. Those need to be verified in your own Supabase project.

## 7. Deploy

Deploy the repository to Vercel, Netlify, or another static Vite host:

1. Build command: `npm run build`.
2. Output directory: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider's environment-variable settings.
4. Add the deployed domain to Supabase Authentication URL Configuration's Site URL/Redirect URLs and Google OAuth origins where applicable.
5. Configure SPA fallback so routes such as `/login`, `/signup`, and `/dashboard` serve `index.html` (Vercel does this automatically for standard Vite deployments; other hosts may need a rewrite rule).
6. Redeploy after adding or changing environment variables.

## Notes

- The dashboard's task queries are scoped by Supabase RLS, not by a frontend-supplied user ID filter.
- Analytics are computed from the currently loaded task records; there is no demo or seeded chart data.
- Dashboard theme preference supports dark and light appearances and is saved locally on the device.
- Notification bell is a visual placeholder; toast feedback is implemented, but a persistent notification center and push delivery are not implemented.
