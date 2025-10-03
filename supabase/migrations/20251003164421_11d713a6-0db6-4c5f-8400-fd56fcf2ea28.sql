-- Trigger para notificar organizador quando inscrição é confirmada no torneio
CREATE OR REPLACE FUNCTION notify_organizer_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_organizer_id uuid;
  v_tournament_name text;
  v_player_name text;
BEGIN
  -- Só notifica quando o pagamento é confirmado
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Buscar organizador e nome do torneio
    SELECT organizer_id, name INTO v_organizer_id, v_tournament_name
    FROM tournaments
    WHERE id = NEW.tournament_id;
    
    -- Buscar nome do jogador
    SELECT full_name INTO v_player_name
    FROM profiles
    WHERE user_id = NEW.user_id;
    
    -- Criar notificação para o organizador
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      v_organizer_id,
      'tournament_registration',
      'Nova inscrição confirmada!',
      COALESCE(v_player_name, 'Um jogador') || ' se inscreveu no torneio ' || v_tournament_name,
      jsonb_build_object(
        'tournament_id', NEW.tournament_id,
        'registration_id', NEW.id,
        'player_id', NEW.user_id,
        'player_name', v_player_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trigger_notify_organizer_on_registration
AFTER INSERT OR UPDATE OF payment_status ON tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION notify_organizer_on_registration();