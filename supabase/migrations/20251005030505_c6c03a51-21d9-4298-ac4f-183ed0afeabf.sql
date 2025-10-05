-- 1) Limpar solicitações pendentes duplicadas (mantém a mais recente)
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
    ORDER BY created_at DESC
  ) AS rn
  FROM public.friend_requests
  WHERE status = 'pending'
)
DELETE FROM public.friend_requests
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2) Trigger para criar amizades ao aceitar solicitações
DROP TRIGGER IF EXISTS trg_create_friendship_on_accept ON public.friend_requests;
CREATE TRIGGER trg_create_friendship_on_accept
AFTER UPDATE ON public.friend_requests
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
EXECUTE FUNCTION public.create_friendship_on_accept();

-- 3) Índice único para evitar duplicidade de amizades
CREATE UNIQUE INDEX IF NOT EXISTS uniq_friendships_pair
ON public.friendships (user_id, friend_id);

-- 4) Índice único parcial para impedir múltiplas solicitações pendentes
CREATE UNIQUE INDEX IF NOT EXISTS uniq_friend_requests_pending_pair
ON public.friend_requests (
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id)
)
WHERE status = 'pending';

-- 5) Impedir auto-convite
ALTER TABLE public.friend_requests
DROP CONSTRAINT IF EXISTS chk_friend_requests_no_self;

ALTER TABLE public.friend_requests
ADD CONSTRAINT chk_friend_requests_no_self CHECK (sender_id <> receiver_id);

-- 6) Atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trg_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER trg_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();