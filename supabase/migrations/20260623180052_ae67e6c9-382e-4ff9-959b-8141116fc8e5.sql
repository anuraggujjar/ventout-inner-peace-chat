
-- Seed demo users (talker + listener)
DO $$
DECLARE
  v_talker uuid := gen_random_uuid();
  v_listener uuid := gen_random_uuid();
BEGIN
  -- Talker
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'talker@demo.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_talker, 'authenticated', 'authenticated',
      'talker@demo.com', crypt('Demo12345!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Demo Talker","role":"talker"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_talker, v_talker::text,
      jsonb_build_object('sub', v_talker::text, 'email', 'talker@demo.com', 'email_verified', true),
      'email', now(), now(), now());
  END IF;

  -- Listener
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'listener@demo.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_listener, 'authenticated', 'authenticated',
      'listener@demo.com', crypt('Demo12345!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Demo Listener","role":"listener"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_listener, v_listener::text,
      jsonb_build_object('sub', v_listener::text, 'email', 'listener@demo.com', 'email_verified', true),
      'email', now(), now(), now());

    -- Ensure profile/role/listener_details exist (in case trigger didn't fire)
    INSERT INTO public.profiles (id, display_name) VALUES (v_listener, 'Demo Listener') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_listener, 'listener') ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.listener_details (user_id) VALUES (v_listener) ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
