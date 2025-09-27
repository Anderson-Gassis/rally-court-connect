-- Apenas corrigir a constraint de result para aceitar valores com acentos e maiúsculas
ALTER TABLE public.match_history 
DROP CONSTRAINT IF EXISTS match_history_result_check;

ALTER TABLE public.match_history 
ADD CONSTRAINT match_history_result_check 
CHECK (result IN ('Vitória', 'vitória', 'Derrota', 'derrota', 'Empate', 'empate'));