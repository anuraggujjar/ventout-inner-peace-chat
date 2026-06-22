-- ============================================================================
-- PLARO — Storage buckets & policies
-- Run AFTER 01_master_schema.sql.
-- ============================================================================

-- Buckets (both PRIVATE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes','voice-notes', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars','avatars', false)
ON CONFLICT (id) DO NOTHING;

-- -------- voice-notes policies --------
-- Path convention: {conversation_id}/{file}
CREATE POLICY "Participants read voice notes"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-notes'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(objects.name))[1]
        AND (c.talker_id = auth.uid() OR c.listener_id = auth.uid())
    )
  );

CREATE POLICY "Participants upload voice notes"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-notes'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(objects.name))[1]
        AND (c.talker_id = auth.uid() OR c.listener_id = auth.uid())
    )
  );

-- -------- avatars policies --------
-- Path convention: {user_id}/{file}
CREATE POLICY "Avatars readable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
