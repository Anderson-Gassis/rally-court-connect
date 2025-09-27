-- Criar dados de teste para demonstração
-- Inserir quadras de exemplo
INSERT INTO public.courts (
  name, 
  type, 
  sport_type, 
  location, 
  address, 
  latitude, 
  longitude, 
  price_per_hour, 
  description, 
  features, 
  available,
  rating
) VALUES 
(
  'Arena Tennis Club - Quadra Central',
  'Saibro',
  'tennis',
  'Jardins, São Paulo - SP',
  'Rua Augusta, 1000 - Jardins',
  -23.5629,
  -46.6544,
  120.00,
  'Quadra profissional de saibro com iluminação completa e vestiários modernos. Ideal para jogos e treinos de alto nível.',
  ARRAY['Iluminada', 'Vestiário', 'Estacionamento', 'Pro Shop', 'Arquibancada'],
  true,
  4.5
),
(
  'Centro Esportivo Vila Madalena',
  'Rápida',
  'tennis', 
  'Vila Madalena, São Paulo - SP',
  'Rua Harmonia, 500 - Vila Madalena',
  -23.5505,
  -46.6893,
  90.00,
  'Quadra rápida sintética ideal para treinamentos e competições. Ambiente moderno e bem equipado.',
  ARRAY['Iluminada', 'Vestiário', 'Cobertura', 'Estacionamento'],
  true,
  4.2
),
(
  'Padel Arena Premium Morumbi',
  'Vidro',
  'padel',
  'Morumbi, São Paulo - SP', 
  'Av. Giovanni Gronchi, 2000 - Morumbi',
  -23.6204,
  -46.7000,
  80.00,
  'Arena de padel com piso de vidro e excelente acústica. Experiência premium para jogadores exigentes.',
  ARRAY['Iluminada', 'Vestiário', 'Estacionamento', 'Bar', 'Arquibancada', 'Pro Shop'],
  true,
  4.8
),
(
  'Beach Tennis Paradise',
  'Areia',
  'beach-tennis',
  'Ipiranga, São Paulo - SP',
  'Rua do Manifesto, 800 - Ipiranga',
  -23.5935,
  -46.6112,
  65.00,
  'Quadra de beach tennis com areia especial importada. Ambiente descontraído e divertido.',
  ARRAY['Vestiário', 'Bar', 'Estacionamento', 'Pública'],
  true,
  4.0
),
(
  'Tênis Clube Pacaembu',
  'Rápida',
  'tennis',
  'Pacaembu, São Paulo - SP',
  'Rua Pacaembu, 200 - Pacaembu',
  -23.5480,
  -46.6656,
  110.00,
  'Clube tradicional com quadra rápida bem mantida. História e tradição no tênis paulistano.',
  ARRAY['Iluminada', 'Vestiário Premium', 'Estacionamento', 'Restaurante', 'Pro Shop'],
  true,
  4.3
);

-- Adicionar algumas reservas de exemplo (histórico) - mas apenas se houver usuários para referenciar
-- Por enquanto vamos focar nas quadras disponíveis

-- Marcar algumas quadras como tendo avaliações
UPDATE public.courts 
SET rating = 4.5 
WHERE name LIKE '%Arena Tennis%';

UPDATE public.courts 
SET rating = 4.2 
WHERE name LIKE '%Vila Madalena%';