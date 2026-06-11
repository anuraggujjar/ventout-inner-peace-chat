# Migrate Plaro to Lovable Cloud

Replace the external Render/Socket.IO backend with a native Lovable Cloud backend. This plan covers enabling Cloud, building the database schema, wiring auth, swapping Socket.IO for Postgres Realtime, and storing voice notes in Storage.

## Phase 1 — Enable Lovable Cloud
- Enable Cloud (provisions Postgres, Auth, Edge Functions, Storage).
- Keep the existing `.env` Supabase values overwritten by Cloud's auto-provisioning.

## Phase 2 — Database schema (migration)

Tables (all in `public`, RLS enabled, GRANTs included):

1. `profiles` — `id uuid PK → auth.users`, `display_name`, `bio`, `avatar_url`, `created_at`.
   - Auto-created via `handle_new_user` trigger on `auth.users` insert.
   - RLS: anyone authenticated can read; users update only their own row.

2. `app_role` enum (`talker`, `listener`, `admin`) + `user_roles` table (`user_id`, `role`) with `has_role()` security-definer function. Role chosen at signup is inserted here (never on profiles).

3. `listener_details` — `user_id PK`, `interests text[]`, `is_available bool`, `topics text[]`. Visible to all authenticated users; editable by owner.

4. `chat_requests` — `id`, `talker_id`, `listener_id` (nullable until accepted), `topic`, `feeling`, `status` (`pending|accepted|declined|cancelled`), `created_at`. RLS: talker sees own; listeners see pending ones matching their topics; both parties see accepted.

5. `conversations` — `id`, `talker_id`, `listener_id`, `request_id`, `started_at`, `ended_at`. RLS: only the two participants.

6. `messages` — `id`, `conversation_id`, `sender_id`, `type` (`text|voice`), `content text`, `audio_path text` (storage path), `duration_seconds int`, `created_at`. RLS: only conversation participants can select/insert; sender_id must equal `auth.uid()`.

7. `feedback` — `id`, `conversation_id`, `from_user`, `rating`, `comment`.

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE messages, chat_requests, conversations;` and `REPLICA IDENTITY FULL` on those.

## Phase 3 — Storage
- Bucket `voice-notes` (private).
- RLS on `storage.objects`: users can upload to `voice-notes/{conversation_id}/...` only if they belong to that conversation; participants can read.
- Avatars bucket `avatars` (public) for profile photos.

## Phase 4 — Auth
- Email/password + Google (Cloud defaults). Phone OTP dropped (not natively supported the same way — confirm below).
- `AuthPage` rewritten to use `supabase.auth.signUp/signInWithPassword/signInWithOAuth`.
- `onAuthStateChange` listener in `AuthContext`; `getSession()` for bootstrap.
- Role selected at signup written to `user_roles` via the signup trigger using `raw_user_meta_data.role`.
- Remove JWT refresh / deadlock logic and the external `authService` HTTP calls.

## Phase 5 — Replace Socket.IO with Postgres Realtime
- Delete `SocketContext`, `useSocket`, `services/socket.ts` usage paths (keep files until pages are migrated, then remove).
- New `useConversation(conversationId)` hook: initial `select` of messages + `supabase.channel().on('postgres_changes', { event: 'INSERT', table: 'messages', filter: 'conversation_id=eq.X' })`.
- New `useChatRequests()` hook for listeners' inbox (realtime on `chat_requests`).
- Sending a text message = `insert` into `messages`. Sending voice = upload to Storage then insert message row with `audio_path`.
- Typing indicators / presence via `channel.track()` (optional, can defer).

## Phase 6 — Refactor pages/services
- Rewrite `services/auth.ts`, `services/profile.ts` to use the Supabase client.
- Update `ChatPage`, `LiveChatPage`, `ListenerHomePage`, `TalkerListPage`, `ChatRequestSentPage`, `TopicSelectionPage`, `FeelingSelectionPage`, `HistoryPage`, `SettingsPage` to use new hooks/tables.
- Keep existing UI/visual identity intact.

## Phase 7 — Cleanup
- Remove `ventoutserver.onrender.com` references, CSP entries for socket.io, and the JWT refresh memory rules (update `mem://` files).
- Update memory index to reflect new architecture.

## Out of scope (confirm)
- Phone OTP login (not in Cloud defaults — would need Twilio config).
- Migrating existing data from the Render backend (fresh start).
- Push notifications.

## Questions before I build
1. **Phone OTP** — drop it, or keep just email + Google?
2. **Existing users on Render** — do we need any data migration, or start fresh?
3. **Voice notes** — keep current base64-in-message approach, or switch to Storage uploads (recommended; smaller payloads, faster realtime)?
4. **Google sign-in** — enable now (I'll wire it up; you'd add Google OAuth credentials in Cloud settings later) or skip for v1?
