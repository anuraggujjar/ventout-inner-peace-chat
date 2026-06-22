# PLARO — Migration Report & Runbook

This package recreates the **entire current PLARO backend** in a fresh Supabase
project you own. The current backend is a Supabase project managed by Lovable
Cloud; everything described here is standard Supabase (Postgres + Auth + Storage
+ Realtime) and is fully portable.

---

## 1. Files in this package

| File | Purpose |
|------|---------|
| `migration/01_master_schema.sql` | Enums, tables, FKs, indexes, RLS policies, role helper, `handle_new_user` trigger, Realtime publication |
| `migration/02_storage.sql`       | Storage buckets (`voice-notes`, `avatars`) + storage.objects RLS policies |
| `migration/README.md`            | This report |

Run order in the new project's SQL editor:
1. `01_master_schema.sql`
2. `02_storage.sql`

---

## 2. Backend resource inventory (what exists today)

### 2.1 Enums (`public`)
- `app_role` — `talker`, `listener`, `admin`
- `message_type` — `text`, `voice`
- `request_status` — `pending`, `accepted`, `declined`, `cancelled`

### 2.2 Tables (`public`)
| Table | Purpose | Notes |
|---|---|---|
| `profiles` | Display name, bio, avatar | 1:1 with `auth.users` |
| `user_roles` | Role assignments | Roles live HERE, never on `profiles` |
| `listener_details` | Listener interests/topics/availability | 1:1 with `auth.users` |
| `chat_requests` | Talker → Listener requests | enum `request_status` |
| `conversations` | Active/ended 1:1 chat sessions | FK to `chat_requests` |
| `messages` | Text + voice messages | `audio_path` references `voice-notes` |
| `feedback` | Post-chat rating & comment | per conversation, per user |

### 2.3 Functions (`public`)
- `has_role(uuid, app_role)` — SECURITY DEFINER, used by RLS to avoid recursion
- `handle_new_user()` — trigger on `auth.users` AFTER INSERT; seeds profile, role, listener_details
- `set_updated_at()` — generic `updated_at` touch trigger

### 2.4 Triggers
- `auth.users → on_auth_user_created → handle_new_user()`
- `profiles / listener_details / chat_requests → set_updated_at()`

### 2.5 RLS policies
All public tables have RLS enabled. Full policy bodies are inlined in
`01_master_schema.sql`. Summary:
- **profiles** — anyone authenticated reads; users insert/update only their own
- **user_roles** — users read only their own rows; writes via SECURITY DEFINER paths only
- **listener_details** — anyone authenticated reads; only owner writes
- **chat_requests** — talker, assigned listener, OR (unassigned + has `listener` role) can read; only talker inserts; participants/listeners can update
- **conversations** — both participants read/insert/update
- **messages** — only conversation participants read/send; sender must equal `auth.uid()`
- **feedback** — submitter or participants can read; only submitter can insert

### 2.6 Storage buckets
| Bucket | Public | Path convention | Policies |
|---|---|---|---|
| `voice-notes` | No | `{conversation_id}/{file}` | Participants read & insert (membership check) |
| `avatars`     | No | `{user_id}/{file}`         | Authed read; owner insert/update/delete |

### 2.7 Realtime publication (`supabase_realtime`)
Tables in publication today:
- `public.messages`
- `public.chat_requests`
- `public.conversations`

### 2.8 Auth providers (currently configured / used by the app)
- Email + Password
- Google (managed OAuth in Lovable Cloud)
- Phone OTP (component present: `src/components/auth/PhoneOTPForm.tsx`)

### 2.9 Edge Functions
**None.** `supabase/functions/` is empty. No server functions to migrate.

### 2.10 Secrets used by the runtime
Currently injected by Lovable Cloud:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` (server only, edge fns only — not used in app today)
- `SUPABASE_DB_URL` (admin only)
- `LOVABLE_API_KEY` (only needed for Lovable AI Gateway; PLARO does not call it today)

Frontend reads only the first two via `src/integrations/supabase/client.ts`
(auto-generated) and `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`).

---

## 3. Features ↔ backend mapping

| Feature | Backend resources |
|---|---|
| Auth (Email / Google / Phone OTP) | `auth.users`, `handle_new_user` trigger, providers in dashboard |
| User Profiles | `profiles`, `avatars` bucket |
| Talker & Listener roles | `user_roles`, `has_role()` |
| Listener approval / availability | `listener_details.is_available` (no separate approval table today — see §6) |
| Chat Requests | `chat_requests` + Realtime |
| Realtime Messaging | `messages`, `conversations` + `supabase_realtime` publication |
| Voice Notes | `messages.audio_path` + `voice-notes` bucket |
| Chat History | `conversations` + `messages` SELECT policies |
| Feedback & Ratings | `feedback` |
| Volunteer Applications | **Not currently in DB** — see §6 |
| Referral System | **Not currently in DB** — see §6 |
| Notifications | **Not currently in DB** — see §6 |
| Subscription & Billing | **Not currently in DB** — see §6 |
| Admin Dashboard | `app_role = 'admin'` + `has_role()`; no admin-only tables yet |
| Audit Logs | **Not currently in DB** — see §6 |

---

## 4. Step-by-step migration

### 4.1 Create the destination Supabase project
1. Create a new Supabase project in your own org.
2. Copy the **Project URL** and **anon (publishable) key** from Project Settings → API.

### 4.2 Apply schema + storage
In the new project's SQL editor, paste and run **in order**:
1. `migration/01_master_schema.sql`
2. `migration/02_storage.sql`

Verify:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
SELECT id, public FROM storage.buckets;
SELECT schemaname||'.'||tablename FROM pg_publication_tables WHERE pubname='supabase_realtime';
```

### 4.3 Configure Auth providers
In **Authentication → Providers** on the new project:
- Enable **Email** (turn "Confirm email" on or off to match current behavior)
- Enable **Google** — paste your own Google OAuth Client ID + Secret. Add the redirect URL Supabase displays to the Google Cloud console's "Authorized redirect URIs"
- Enable **Phone** if you want OTP — configure an SMS provider (Twilio, MessageBird, etc.)

In **Authentication → URL Configuration**, set:
- Site URL → your production URL
- Additional redirect URLs → preview / localhost URLs

### 4.4 Move the data (talkers, chats, messages, feedback)
Run from a machine with network access to both projects. Use `pg_dump` against
the **source** DB URL and `psql` against the **destination**:

```bash
# DATA ONLY, public schema only — schema is already in place
pg_dump "$SOURCE_DB_URL" \
  --data-only --no-owner --no-privileges \
  --schema=public \
  --disable-triggers \
  -t public.profiles -t public.user_roles -t public.listener_details \
  -t public.chat_requests -t public.conversations \
  -t public.messages -t public.feedback \
  > plaro_data.sql

psql "$DEST_DB_URL" -f plaro_data.sql
```

Notes:
- `--disable-triggers` prevents the `handle_new_user` trigger from firing while you reload `profiles` / `user_roles`.
- `profiles`, `user_roles`, `listener_details` all FK to `auth.users(id)`. You **must** have migrated the auth users first (see §5.1) or the inserts will fail.
- `SUPABASE_DB_URL` for the source is available to you via Lovable Cloud's Project Settings; if you cannot retrieve it, contact Lovable support for a one-time export.

### 4.5 Move storage objects
```bash
# Install supabase CLI, then for each bucket:
supabase storage cp -r "sb://voice-notes" ./voice-notes --project-ref <SOURCE>
supabase storage cp -r ./voice-notes "sb://voice-notes"  --project-ref <DEST>

supabase storage cp -r "sb://avatars" ./avatars --project-ref <SOURCE>
supabase storage cp -r ./avatars "sb://avatars"  --project-ref <DEST>
```
Paths are preserved, so the `audio_path` / `avatar_url` references in the data keep working.

### 4.6 Realtime
Already enabled by `01_master_schema.sql` (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`). No dashboard toggling needed.

### 4.7 Point the app at the new project
Update `.env` (NOT `src/integrations/supabase/client.ts`, which is auto-generated and tied to Lovable Cloud):

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon key>
VITE_SUPABASE_PROJECT_ID=<your-ref>
```

**To remove the Lovable Cloud dependency completely**, do this in a *new* Lovable
project where Cloud is disabled (or outside Lovable). Then:
- Delete `src/integrations/lovable/` and replace its OAuth helper with
  `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
- Re-generate types: `supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts`.

---

## 5. Things that CANNOT be migrated automatically

### 5.1 Auth users + password hashes
Supabase does **not** expose password hashes through the standard Data API.
Options:
- **Recommended:** ask Supabase support for an `auth.users` dump from the source project (they can produce one for projects you own; for a Lovable-managed project, request it through Lovable support before migration).
- Or: re-invite all users via magic links / "forgot password" so they reset on first login on the new project. Their `id` (UUID) will then be different — relink data by email.
- Or (only if you can read `auth.users` on both ends): copy `id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at` rows directly. This preserves user IDs so all FKs keep working.

### 5.2 Storage objects
Files themselves must be downloaded from the source bucket and re-uploaded to the destination. The SQL only recreates buckets and policies.

### 5.3 OAuth provider credentials
Google client ID / secret are workspace-level config in the Supabase dashboard. You must add your own; Lovable's managed credentials are not portable.

### 5.4 Lovable AI Gateway (`LOVABLE_API_KEY`)
Only relevant if you later add AI features. Not used by PLARO today.

### 5.5 Auto-generated client + types
`src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts` are regenerated by Lovable Cloud against its managed project. In a self-owned project, regenerate them with the Supabase CLI (`supabase gen types typescript`) and replace the client with a hand-written one that reads from your `.env`.

---

## 6. Features the user listed that don't exist in the DB yet

These were in your migration spec but are **not currently implemented**, so there is nothing to migrate. Flagged here so nothing is silently overlooked:

- **Listener approval workflow** — today there's only `listener_details.is_available`; there is no `application_status` or admin-approval table.
- **Volunteer applications** — no table.
- **Referral system** — no table.
- **Notifications** — no table; Realtime alone delivers chat events.
- **Subscription & billing** — no Stripe/Paddle integration, no `subscriptions` table.
- **Audit logs** — no table; Supabase's built-in `auth.audit_log_entries` covers auth events only.
- **Admin dashboard tables** — `admin` role exists in `app_role`, but no admin-only tables/policies are defined.

If you want any of these built, say which ones and I'll add them as new migrations.

---

## 7. Risks & gotchas

| Risk | Mitigation |
|---|---|
| Password hashes unrecoverable from a managed project | Plan a forced password reset OR get a hash export before migration |
| User UUIDs change → all FKs break | Preserve `auth.users.id` during user export; or remap by email in a single transaction |
| Storage files not copied → broken voice notes/avatars | Use the `supabase storage cp` step in §4.5 |
| Google OAuth login fails post-cutover | Add new project's callback URL to your Google OAuth client; update Site URL |
| Realtime not firing on new project | Confirm `pg_publication_tables` includes all three tables after step 4.2 |
| App still hits old project | Verify `.env` values and that `src/integrations/supabase/client.ts` matches your new URL/key |
| Lovable Cloud auto-regenerates `client.ts` | Migration must be done in a non-Cloud project, otherwise the file gets overwritten |

---

## 8. Post-migration verification checklist

Run these against the **new** project and confirm each:

- [ ] `SELECT count(*) FROM auth.users;` matches source
- [ ] `SELECT count(*) FROM public.profiles;` matches source
- [ ] `SELECT count(*) FROM public.messages;` matches source
- [ ] Signup creates rows in `profiles` AND `user_roles` (trigger works)
- [ ] Google login round-trips and lands on `/topic-selection` (talker) or `/listener/home` (listener)
- [ ] A talker can create a chat request; a listener sees it in Realtime
- [ ] Sending a text message updates the other client in <1s
- [ ] Recording a voice note uploads to `voice-notes/{conversation_id}/...` and the recipient can play it
- [ ] Avatar upload writes to `avatars/{user_id}/...` and renders
- [ ] Submitting feedback writes one `feedback` row
- [ ] RLS denies cross-user access: log in as user A and try to `SELECT` user B's messages → 0 rows

When every box is ticked, the new project is the sole backend and the dependency on the Lovable-managed project is removed.
