-- Atualizar categorias dos jogadores existentes
-- Mapeamento: Iniciante → C, Intermediário → B, Avançado → A

UPDATE profiles
SET skill_level = CASE
  WHEN skill_level = 'Iniciante' THEN 'C'
  WHEN skill_level = 'Intermediário' THEN 'B'
  WHEN skill_level = 'Avançado' THEN 'A'
  WHEN skill_level = 'Profissional' THEN 'Profissional'
  ELSE skill_level
END
WHERE skill_level IN ('Iniciante', 'Intermediário', 'Avançado', 'Profissional');