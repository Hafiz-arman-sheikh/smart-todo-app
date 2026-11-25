1. Authentication (Supabase Auth)
- Sign Up: New user apna full name, email aur password enter karke account create kar sakta hai.
- Login: Registered user email aur password ke through authenticate hota hai.
- Logout: User apni active session terminate karke account se logout kar sakta hai.
- Session Management: Supabase authenticated user ki session manage karta hai.
- Protected Routes: Dashboard sirf authenticated users access kar sakte hain.
2. Database (Supabase PostgreSQL)
- Task Storage: User ke tasks PostgreSQL database mein permanently save hote hain.
- User ID: Har task ke saath authenticated user ka unique user_id store hota hai.
- CRUD Operations: User tasks Create, Read, Update aur Delete kar sakta hai.
- Data Persistence: Page refresh ya dobara login karne par saved tasks database se load hote hain.
3. Row Level Security (RLS)
- User Data Isolation: Har user sirf apne tasks access kar sakta hai.
- Authentication Verification: Supabase auth.uid() ke through current logged-in user ki identity verify karta hai.
- SELECT Policy: User sirf apne tasks read kar sakta hai.
- INSERT Policy: User apne user_id ke saath new task create kar sakta hai.
- UPDATE Policy: User sirf apne tasks update kar sakta hai.
- DELETE Policy: User sirf apne tasks delete kar sakta hai.
- Data Security: Ek user doosre user ke private tasks access nahi kar sakta, provided all relevant RLS policies are correctly configured.
4. Task Management
- Add Task: New task title, description aur other details ke saath create hota hai.
- Edit Task: Existing task ki information update kar sakte hain.
- Delete Task: Unwanted task remove kar sakte hain.
- Complete Task: Task status change karke Completed mark kar sakte hain.
- Priority: Tasks ko different priority levels assign kar sakte hain.
- Due Date & Time: Task ke liye deadline set kar sakte hain.
5. Search & Filters
- Search: Task title ke through specific task search kar sakte hain.
- Status Filter: Pending aur Completed tasks separate dekh sakte hain.
- Category Filter: Tasks ko categories ke according filter kar sakte hain.
- Priority Filter: High, Medium aur Low priority tasks identify kar sakte hain.
6. Calendar & Recurring Tasks
- Calendar View: Tasks ko calendar ke through date-wise dekh sakte hain.
- Due Date Tracking: Upcoming deadlines identify kar sakte hain.
- Recurring Tasks: Daily ya configured recurring schedule ke according next task automatically generate hota hai.
- Duplicate Prevention: next_occurrence_created field track karti hai ke recurring task ka next occurrence already create hua hai ya nahi.
7. Analytics Dashboard
- Total Tasks: Total created tasks display karta hai.
- Completed Tasks: Successfully completed tasks ka count show karta hai.
- Pending Tasks: Incomplete tasks track karta hai.
- Completion Rate: Completed tasks aur total tasks ke ratio se progress percentage calculate hoti hai.
- Charts: Task productivity aur progress ko visual form mein display karte hain.
8. Browser Notifications
- Notification Permission: Browser se notification permission request hoti hai.
- Due Task Reminder: Due time par browser notification generate hoti hai.
- Priority Information: Notification mein task title aur priority display hoti hai.
- Duplicate Prevention: LocalStorage mein notification key save hoti hai, taake same task ki notification repeatedly na aaye.
- Browser API: Notifications browser ke native Notification API se generate hoti hain.
Note: Browser reminders ke liye app ka browser tab open rehna zaroori hai.
9. Profile & Settings
- Profile Information: User apna full name update kar sakta hai.
- Password Update: Account password change kar sakta hai.
- Dark / Light Mode: Interface theme switch kar sakta hai.
- Notification Settings: Browser notification permission enable kar sakta hai.
- Logout: Settings/profile menu se account sign out kar sakta hai.
10. Frontend Technologies
- React: Component-based user interface build karne ke liye.
- TypeScript: Static typing aur development-time error checking ke liye.
- Tailwind CSS: Responsive styling aur UI design ke liye.
- React Router: Different pages aur protected navigation manage karne ke liye.
- Lucide React: Icons display karne ke liye.
- Recharts: Analytics charts create karne ke liye.
- Framer Motion: UI animations ke liye.
- React Hook Form & Zod: Form handling aur validation ke liye.
- Sonner: Success aur error toast notifications ke liye.



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
