-- Ensure unique user mapping on profiles.user_id so other tables can reference it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add missing foreign keys for friend_requests -> profiles (sender and receiver)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friend_requests_sender_id_fkey'
  ) THEN
    ALTER TABLE public.friend_requests
    ADD CONSTRAINT friend_requests_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friend_requests_receiver_id_fkey'
  ) THEN
    ALTER TABLE public.friend_requests
    ADD CONSTRAINT friend_requests_receiver_id_fkey
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing foreign keys for friendships -> profiles (user and friend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friendships_user_id_fkey'
  ) THEN
    ALTER TABLE public.friendships
    ADD CONSTRAINT friendships_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friendships_friend_id_fkey'
  ) THEN
    ALTER TABLE public.friendships
    ADD CONSTRAINT friendships_friend_id_fkey
    FOREIGN KEY (friend_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status ON public.friend_requests(receiver_id, status, created_at);
