-- Corrigir search_path da função - usar CASCADE
DROP FUNCTION IF EXISTS update_instructor_availability_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_instructor_availability_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER update_instructor_availability_timestamp
BEFORE UPDATE ON public.instructor_availability
FOR EACH ROW
EXECUTE FUNCTION update_instructor_availability_updated_at();