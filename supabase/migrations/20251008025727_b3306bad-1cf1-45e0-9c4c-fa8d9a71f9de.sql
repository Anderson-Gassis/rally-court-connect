-- Criar função segura para criar perfil de instrutor durante signup
CREATE OR REPLACE FUNCTION public.create_instructor_profile(
  p_user_id uuid,
  p_specialization text[],
  p_experience_years integer,
  p_hourly_rate numeric,
  p_bio text,
  p_location text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir o perfil do instrutor
  INSERT INTO public.instructor_info (
    user_id,
    specialization,
    experience_years,
    hourly_rate,
    bio,
    location,
    trial_class_available,
    trial_class_price,
    verified
  ) VALUES (
    p_user_id,
    p_specialization,
    p_experience_years,
    p_hourly_rate,
    p_bio,
    p_location,
    true,
    0,
    false
  );
END;
$$;