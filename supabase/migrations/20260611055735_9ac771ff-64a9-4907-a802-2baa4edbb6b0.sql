
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('talker','listener','admin');
CREATE TYPE public.request_status AS ENUM ('pending','accepted','declined','cancelled');
CREATE TYPE public.message_type AS ENUM ('text','voice');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ LISTENER DETAILS ============
CREATE TABLE public.listener_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] NOT NULL DEFAULT '{}',
  topics TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listener_details TO authenticated;
GRANT ALL ON public.listener_details TO service_role;
ALTER TABLE public.listener_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listener details visible to authenticated"
  ON public.listener_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Listener manages own details"
  ON public.listener_details FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ CHAT REQUESTS ============
CREATE TABLE public.chat_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listener_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  topic TEXT,
  feeling TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.chat_requests TO authenticated;
GRANT ALL ON public.chat_requests TO service_role;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talker sees own requests"
  ON public.chat_requests FOR SELECT TO authenticated
  USING (auth.uid() = talker_id OR auth.uid() = listener_id OR (listener_id IS NULL AND public.has_role(auth.uid(),'listener')));
CREATE POLICY "Talker creates own requests"
  ON public.chat_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = talker_id);
CREATE POLICY "Participants update requests"
  ON public.chat_requests FOR UPDATE TO authenticated
  USING (auth.uid() = talker_id OR auth.uid() = listener_id OR public.has_role(auth.uid(),'listener'))
  WITH CHECK (auth.uid() = talker_id OR auth.uid() = listener_id OR public.has_role(auth.uid(),'listener'));

-- ============ CONVERSATIONS ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.chat_requests(id) ON DELETE SET NULL,
  talker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listener_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants see conversation"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = talker_id OR auth.uid() = listener_id);
CREATE POLICY "Participants create conversation"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = talker_id OR auth.uid() = listener_id);
CREATE POLICY "Participants update conversation"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = talker_id OR auth.uid() = listener_id);

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.message_type NOT NULL DEFAULT 'text',
  content TEXT,
  audio_path TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c
                 WHERE c.id = conversation_id
                   AND (c.talker_id = auth.uid() OR c.listener_id = auth.uid())));
CREATE POLICY "Participants send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()
              AND EXISTS (SELECT 1 FROM public.conversations c
                          WHERE c.id = conversation_id
                            AND (c.talker_id = auth.uid() OR c.listener_id = auth.uid())));

-- ============ FEEDBACK ============
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own feedback or as participant"
  ON public.feedback FOR SELECT TO authenticated
  USING (from_user = auth.uid()
         OR EXISTS (SELECT 1 FROM public.conversations c
                    WHERE c.id = conversation_id
                      AND (c.talker_id = auth.uid() OR c.listener_id = auth.uid())));
CREATE POLICY "Users submit own feedback"
  ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (from_user = auth.uid());

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER chat_requests_updated_at BEFORE UPDATE ON public.chat_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER listener_details_updated_at BEFORE UPDATE ON public.listener_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + role on signup, using raw_user_meta_data.role and display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
  _display TEXT;
BEGIN
  _display := COALESCE(NEW.raw_user_meta_data->>'display_name',
                       NEW.raw_user_meta_data->>'name',
                       split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, _display)
  ON CONFLICT (id) DO NOTHING;

  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'talker')::public.app_role;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF _role = 'listener' THEN
    INSERT INTO public.listener_details (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ REALTIME ============
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_requests REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
