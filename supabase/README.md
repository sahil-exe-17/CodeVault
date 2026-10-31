# CodeVault — Supabase Database Setup

This directory contains all database configuration, migrations, and seed data for the CodeVault platform.

## Directory Structure

```
supabase/
├── config.toml              # Local Supabase CLI config
├── migrations/
│   └── 001_initial_schema.sql   # Full schema: tables, RLS, triggers, views
├── seed.sql                 # Demo data for local development
└── README.md                # This file
```

---

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running (for local dev)
- Node.js 18+ (for the frontend)

---

## Option A: Hosted Supabase Project (Recommended for Production)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose your organization, set a project name (e.g. `codevault`), strong DB password, and region
3. Wait ~2 minutes for provisioning

### 2. Get Your API Keys

From the Supabase Dashboard → **Project Settings** → **API**:

| Variable | Where to find |
|----------|--------------|
| `SUPABASE_URL` | Project URL (e.g. `https://xyzabc.supabase.co`) |
| `SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_KEY` | `service_role` key (**keep secret — server-side only**) |

### 3. Run the Migration

**Via Supabase Dashboard SQL Editor:**
1. Dashboard → **SQL Editor** → **New query**
2. Paste the full contents of `migrations/001_initial_schema.sql`
3. Click **Run**

**Via Supabase CLI (linked project):**
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. (Optional) Load Seed Data

```bash
# Via CLI
supabase db reset --linked   # WARNING: drops and recreates all data

# Or paste seed.sql in the SQL Editor (safer for existing projects)
```

---

## Option B: Local Development with Supabase CLI

### 1. Start Local Supabase

```bash
cd e:\CodeVault
supabase init      # only first time
supabase start
```

This starts local services at:
- **API**: http://localhost:54321
- **Studio**: http://localhost:54323
- **DB**: postgresql://postgres:postgres@localhost:54322/postgres

### 2. Apply Migrations

```bash
supabase db reset   # applies all migrations/001_initial_schema.sql + seed.sql
```

Or apply just the migration:
```bash
supabase migration up
```

### 3. Get Local Keys

```bash
supabase status
```

Copy the `anon key` and `service_role key` from the output.

---

## Environment Variables

Create a `.env.local` file in the project root (`e:\CodeVault\.env.local`):

```env
# ─── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only — NEVER expose in frontend bundles
SUPABASE_SERVICE_KEY=your-service-role-key-here

# ─── AI (Gemini) ────────────────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key-here

# ─── App ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security**: `SUPABASE_SERVICE_KEY` bypasses all RLS policies. Only use it in server-side API routes / Edge Functions. Never expose it to the browser.

---

## Storage Buckets Setup

After running the migration, create these storage buckets in the Supabase Dashboard → **Storage**:

| Bucket Name | Public? | Purpose |
|-------------|---------|---------|
| `experiment-files` | ❌ Private | User-uploaded files per experiment |
| `avatars` | ✅ Public | User profile pictures |

### Storage RLS Policies

Add these policies via Dashboard → Storage → \[bucket\] → **Policies**:

**`experiment-files` bucket — INSERT:**
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

**`experiment-files` bucket — SELECT/DELETE:**
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

**`avatars` bucket — INSERT/UPDATE:**
```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```

Recommended file path format: `{user_id}/{experiment_id}/{filename}`

---

## Schema Overview

### Tables

| Table | Description |
|-------|-------------|
| `users` | Extends `auth.users` with profile fields |
| `subjects` | Academic subjects (Data Structures, OS, etc.) |
| `experiments` | Core — stores code, aim, algorithm, complexity |
| `experiment_files` | Files attached to experiments (Supabase Storage refs) |
| `experiment_notes` | Additional notes per experiment |
| `ai_explanations` | Cached AI-generated explanations (3 modes) |
| `conversations` | Chat session containers |
| `messages` | Individual chat messages (user / assistant) |
| `flashcards` | Study flashcards with difficulty and accuracy tracking |
| `quizzes` | Quiz containers (MCQ, output prediction, etc.) |
| `quiz_questions` | Individual questions with options A–D |
| `quiz_attempts` | Recorded quiz attempt results with answers (JSONB) |
| `revision_sessions` | Scheduled and completed revision sessions |
| `exam_schedules` | Exam dates with linked experiment arrays |
| `bookmarks` | User bookmarks (unique per user+experiment) |

### Key Relationships

```
auth.users
    └── users (1:1 via trigger)
          ├── subjects (1:N)
          │     └── experiments (1:N)
          │           ├── experiment_files (1:N)
          │           ├── experiment_notes (1:N)
          │           ├── ai_explanations (1:3 by mode)
          │           ├── flashcards (1:N)
          │           ├── revision_sessions (1:N)
          │           └── quizzes (optional FK)
          ├── conversations (1:N)
          │     └── messages (1:N)
          ├── quiz_attempts (1:N)
          ├── bookmarks (1:N, unique per experiment)
          └── exam_schedules (1:N)
```

### Enums

| Enum | Values |
|------|--------|
| `language_enum` | `python`, `java`, `c`, `cpp`, `javascript`, `typescript`, `other` |
| `ai_mode_enum` | `beginner`, `detailed`, `exam` |
| `message_role_enum` | `user`, `assistant` |
| `difficulty_enum` | `easy`, `medium`, `hard` |
| `quiz_type_enum` | `mcq`, `output_prediction`, `fill_blanks`, `debug_challenge`, `mock_exam` |
| `session_type_enum` | `quick`, `flashcard`, `mcq`, `viva` |

### Auto-Maintained Fields

| Field | Mechanism |
|-------|-----------|
| `subjects.experiment_count` | Trigger on `experiments` INSERT/DELETE/UPDATE |
| `experiments.is_bookmarked` | Trigger on `bookmarks` INSERT/DELETE |
| `experiments.is_revised` + `revision_count` | Trigger on `revision_sessions` UPDATE (when `completed_at` set) |
| `*.updated_at` | `set_updated_at()` trigger on all relevant tables |
| `users` row | `handle_new_user()` trigger on `auth.users` INSERT |

### Useful Views

| View | Description |
|------|-------------|
| `experiments_with_subject` | Experiments joined with subject name, color, semester |
| `flashcard_stats` | Per-experiment accuracy % and difficulty breakdown |

---

## RLS Summary

All tables have Row Level Security **enabled**. Every policy enforces `auth.uid() = user_id`. Users can only read, insert, update, and delete their own data.

The `messages` and `quiz_questions` tables use indirect policies (join through parent table) since they don't have a direct `user_id` column.

---

## Resetting the Database (Local Dev Only)

```bash
supabase db reset
```

This drops all tables, re-runs migrations, and re-seeds from `seed.sql`.

> ⚠️ **Never run `db reset` against a linked production project.**
