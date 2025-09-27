-- Primeiro, criar apenas os torneios sem o match history
INSERT INTO public.tournaments (
  name,
  description,
  sport_type,
  start_date,
  end_date,
  registration_deadline,
  location,
  entry_fee,
  prize_pool,
  max_participants,
  status
) VALUES
(
  'Copa Kourtify de Tênis 2025',
  'Torneio oficial da plataforma Kourtify. Aberto para todas as categorias. Premiação de R$ 5.000 para o campeão.',
  'tennis',
  '2025-02-15',
  '2025-02-17',
  '2025-02-10',
  'São Paulo - SP',
  150.00,
  5000.00,
  64,
  'upcoming'
),
(
  'Circuito de Padel Verão',
  'Torneio de padel para duplas. Ambiente descontraído e muita diversão garantida.',
  'padel',
  '2025-01-20',
  '2025-01-21',
  '2025-01-15',
  'Rio de Janeiro - RJ',
  200.00,
  3000.00,
  32,
  'upcoming'
),
(
  'Beach Tennis Festival',
  'Festival de beach tennis com música, food trucks e muito esporte na areia.',
  'beach-tennis',
  '2025-03-01',
  '2025-03-03',
  '2025-02-25',
  'Santos - SP',
  80.00,
  2000.00,
  128,
  'upcoming'
),
(
  'Torneio de Inverno - Tênis',
  'Torneio clássico de tênis em quadra coberta. Tradição e alto nível competitivo.',
  'tennis',
  '2025-06-10',
  '2025-06-15',
  '2025-06-01',
  'Curitiba - PR',
  120.00,
  4000.00,
  48,
  'upcoming'
),
(
  'Open de Padel Kourtify',
  'Maior torneio de padel do ano na plataforma. Inscrições limitadas.',
  'padel', 
  '2025-04-05',
  '2025-04-07',
  '2025-03-28',
  'Belo Horizonte - MG',
  180.00,
  6000.00,
  64,
  'upcoming'
) ON CONFLICT DO NOTHING;