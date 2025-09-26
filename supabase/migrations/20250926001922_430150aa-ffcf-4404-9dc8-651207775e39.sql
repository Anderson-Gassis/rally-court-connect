-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  skill_level TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courts table
CREATE TABLE public.courts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('tennis', 'padel', 'beach-tennis')),
  image_url TEXT,
  location TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_per_hour NUMERIC NOT NULL CHECK (price_per_hour > 0),
  available BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_price NUMERIC NOT NULL CHECK (total_price > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('tennis', 'padel', 'beach-tennis')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE NOT NULL,
  max_participants INTEGER,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  organizer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_registrations table
CREATE TABLE public.tournament_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  UNIQUE(tournament_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for courts
CREATE POLICY "Courts are viewable by everyone" ON public.courts
  FOR SELECT USING (true);

CREATE POLICY "Court owners can update their courts" ON public.courts
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create courts" ON public.courts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tournaments
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Tournament organizers can update their tournaments" ON public.tournaments
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for tournament registrations
CREATE POLICY "Users can view their own tournament registrations" ON public.tournament_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for tournaments" ON public.tournament_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courts_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample courts data
INSERT INTO public.courts (id, name, type, sport_type, image_url, location, address, latitude, longitude, rating, price_per_hour, available, features, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Clube Atlético Paulistano', 'Saibro', 'tennis', 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500', 'Jardins, São Paulo', 'Rua Honduras, 88 - Jardins', -23.5629, -46.6544, 4.8, 80, true, '{"Iluminada", "Vestiário", "Estacionamento"}', 'Tradicional clube de tênis no coração dos Jardins'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tennis Park', 'Rápida', 'tennis', 'https://images.unsplash.com/photo-1614743758466-e569f4791116?q=80&w=500', 'Moema, São Paulo', 'Av. Ibirapuera, 2927 - Moema', -23.5739, -46.6623, 4.5, 60, false, '{"Cobertura", "Arquibancada"}', 'Quadras modernas com cobertura completa'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Condomínio Green Park', 'Saibro', 'padel', 'https://images.unsplash.com/photo-1620742820748-87c09249a72a?q=80&w=500', 'Pinheiros, São Paulo', 'Rua Butantã, 298 - Pinheiros', -23.5672, -46.6982, 4.2, 50, true, '{"Iluminada", "Coberta"}', 'Quadra de padel em condomínio residencial'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Academia Ace', 'Indoor', 'beach-tennis', 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=500', 'Vila Olímpia, São Paulo', 'Rua Olimpíadas, 205 - Vila Olímpia', -23.5958, -46.6866, 4.9, 120, true, '{"Ar-condicionado", "Pro Shop", "Restaurante"}', 'Centro completo de beach tennis indoor'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Centro Esportivo Ibirapuera', 'Areia', 'beach-tennis', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=500', 'Ibirapuera, São Paulo', 'Parque Ibirapuera - Portão 10', -23.5873, -46.6607, 4.1, 40, true, '{"Pública", "Estacionamento"}', 'Quadras públicas no Parque do Ibirapuera'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Arena Beach Sports', 'Areia', 'beach-tennis', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=500', 'Higienópolis, São Paulo', 'Rua Conselheiro Brotero, 1539', -23.5375, -46.6472, 4.7, 70, true, '{"Vestiário Premium", "Bar", "Loja"}', 'Arena premium de beach tennis'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Padel Center', 'Vidro', 'padel', 'https://images.unsplash.com/photo-1626224583764-f0cb4761e5cc?q=80&w=500', 'Moema, São Paulo', 'Rua Pavão, 1106 - Moema', -23.5835, -46.6623, 4.6, 90, true, '{"Iluminada", "Vestiário", "Estacionamento"}', 'Centro especializado em padel'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Padel Club SP', 'Vidro', 'padel', 'https://images.unsplash.com/photo-1626224583764-f0cb4761e5cc?q=80&w=500', 'Pinheiros, São Paulo', 'Rua dos Pinheiros, 1602', -23.5652, -46.6982, 4.4, 85, false, '{"Vestiário", "Bar", "Loja"}', 'Clube de padel com infraestrutura completa');

-- Insert sample tournaments
INSERT INTO public.tournaments (id, name, description, sport_type, start_date, end_date, registration_deadline, max_participants, entry_fee, prize_pool, location, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Torneio de Tênis de Verão', 'Campeonato aberto de tênis para todas as categorias', 'tennis', '2024-03-15', '2024-03-17', '2024-03-01', 64, 150, 5000, 'Clube Atlético Paulistano', 'upcoming'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Copa Paulista de Padel', 'Grande torneio de padel do estado de São Paulo', 'padel', '2024-04-10', '2024-04-14', '2024-03-25', 32, 200, 8000, 'Padel Center', 'upcoming'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Beach Tennis Championship', 'Campeonato municipal de beach tennis', 'beach-tennis', '2024-05-20', '2024-05-22', '2024-05-05', 48, 100, 3000, 'Arena Beach Sports', 'upcoming');