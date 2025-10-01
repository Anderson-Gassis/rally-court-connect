-- Adicionar campos específicos para professores na tabela partner_info
ALTER TABLE public.partner_info 
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS location text;

COMMENT ON COLUMN public.partner_info.specialization IS 'Especialização do professor (ex: Iniciantes, Avançado, Infantil)';
COMMENT ON COLUMN public.partner_info.location IS 'Local de atendimento do professor (ex: São Paulo - Zona Sul)';