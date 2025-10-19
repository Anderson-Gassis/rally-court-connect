import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddMatchModal from '@/components/AddMatchModal';
import { BookingDetailsModal } from '@/components/BookingDetailsModal';
import { ChallengesCard } from '@/components/ChallengesCard';
import { ReportResultModal } from '@/components/ReportResultModal';
import { ChatInterface } from '@/components/ChatInterface';
import { FriendsManager } from '@/components/FriendsManager';
import { LeaguesManager } from '@/components/LeaguesManager';
import BookingCreditsDisplay from '@/components/BookingCreditsDisplay';
import { bookingsService } from '@/services/bookingsService';
import { challengesService } from '@/services/challengesService';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Trophy, 
  User, 
  MapPin, 
  Clock,
  Star,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  TrendingUp,
  MessageSquare,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayerProfile {
  id: string;
  full_name: string;
  email: string;
  skill_level?: string;
  location?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  playing_time?: string;
  dominant_hand?: string;
  preferred_surface?: string;
  favorite_courts?: string[];
  date_of_birth?: string;
}

interface MatchHistory {
  id: string;
  opponent_name: string;
  match_date: string;
  result: string;
  score?: string;
  sport_type: string;
  court_name?: string;
  duration_minutes?: number;
  notes?: string;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  courts: {
    name: string;
    location: string;
    sport_type: string;
  };
}

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [reportResultModal, setReportResultModal] = useState<{ isOpen: boolean; challengeId: string; opponentName: string }>({
    isOpen: false,
    challengeId: '',
    opponentName: ''
  });
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [bracketStats, setBracketStats] = useState<{ wins: number; losses: number; total: number }>({ wins: 0, losses: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('games');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  useEffect(() => {
    // Aguardar o loading terminar antes de verificar autenticação
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Só redirecionar se o user estiver carregado E não for player OU admin
    if (user && user.role && user.role !== 'player' && !user.isAdmin) {
      navigate('/');
      toast.error('Acesso restrito a jogadores');
      return;
    }

    // Só buscar dados se o user estiver completamente carregado
    if (user && user.role) {
      fetchPlayerData();
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  // Ler a aba da URL quando o componente montar ou os parâmetros mudarem
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Confirmar pagamento de aula quando retornar do Stripe
  useEffect(() => {
    const confirmClassPayment = async () => {
      const paymentParam = searchParams.get('payment');
      const sessionId = searchParams.get('session_id');

      if (paymentParam === 'success' && sessionId) {
        try {
          const { data, error } = await supabase.functions.invoke('confirm-instructor-class-payment', {
            body: { sessionId }
          });

          if (error) throw error;

          if (data.success) {
            toast.success('Pagamento confirmado! Sua aula foi agendada com sucesso.');
            // Recarregar os dados para mostrar a nova reserva
            if (user) {
              fetchPlayerData();
            }
          } else {
            toast.error('Pagamento não foi confirmado. Entre em contato com o suporte.');
          }
        } catch (error) {
          console.error('Error confirming class payment:', error);
          toast.error('Erro ao confirmar pagamento da aula.');
        } finally {
          // Limpar parâmetros da URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };

    confirmClassPayment();
  }, [searchParams, user]);

  const fetchPlayerData = async () => {
    if (!user) return;

    try {
      // Buscar perfil do jogador
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Permitir que admins acessem mesmo sem perfil
      if (profileError && profileError.code !== 'PGRST116' && !user.isAdmin) {
        throw profileError;
      }
      setProfile(profileData);

      // Buscar histórico de partidas
      const { data: matchData, error: matchError } = await supabase
        .from('match_history')
        .select('*')
        .eq('player_id', user.id)
        .order('match_date', { ascending: false })
        .limit(10);

      if (matchError && !user.isAdmin) throw matchError;
      setMatchHistory(matchData || []);

      // Buscar reservas
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          courts!inner(name, location, sport_type)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .limit(10);

      if (bookingError && !user.isAdmin) throw bookingError;
      setBookings(bookingData || []);

      // Buscar desafios
      setChallengesLoading(true);
      try {
        const challengesData = await challengesService.getChallengesWithProfiles();
        setChallenges(challengesData || []);
      } catch (error) {
        if (!user.isAdmin) throw error;
        setChallenges([]);
      }
      setChallengesLoading(false);

      // Buscar torneios do usuário (inscrições)
      setTournamentsLoading(true);
      const { data: registrationData, error: regError } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          tournaments (
            id,
            name,
            location,
            start_date,
            end_date,
            sport_type,
            status,
            bracket_generated,
            tournament_code
          )
        `)
        .eq('user_id', user.id)
        .order('registration_date', { ascending: false });

      if (regError && !user.isAdmin) throw regError;

      // Buscar torneios criados pelo usuário
      const { data: createdTournamentsData, error: createdError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (createdError && !user.isAdmin) throw createdError;

      // Combinar os dois tipos de torneios
      const allTournaments = [
        ...(registrationData || []),
        ...(createdTournamentsData || []).map(tournament => ({
          id: tournament.id,
          tournament_id: tournament.id,
          user_id: user.id,
          payment_status: 'organizer',
          registration_date: tournament.created_at,
          tournaments: tournament,
          is_organizer: true
        }))
      ];

      setTournaments(allTournaments);
      setTournamentsLoading(false);

    } catch (error) {
      console.error('Error fetching player data:', error);
      toast.error('Erro ao carregar dados do jogador');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto autentica ou carrega dados
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const wins = matchHistory.filter(m => ['vitória','vitoria','win'].includes((m.result || '').toLowerCase())).length;
  const losses = matchHistory.filter(m => ['derrota','loss'].includes((m.result || '').toLowerCase())).length;
  const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.booking_date) >= new Date() && booking.status === 'confirmed'
  );
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  
  // Contar desafios aceitos (próximos jogos)
  const acceptedChallenges = challenges.filter(c => 
    c.status === 'accepted' && new Date(c.preferred_date) >= new Date()
  );
  const totalUpcomingGames = upcomingBookings.length + acceptedChallenges.length;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel || !user) return;

    setIsCancelling(true);
    try {
      const result = await bookingsService.cancelBooking(bookingToCancel.id, user.id);
      
      if (!result.canCancel) {
        toast.error(result.reason || 'Não foi possível cancelar a reserva');
        setIsCancelDialogOpen(false);
        setBookingToCancel(null);
        return;
      }

      toast.success('Reserva cancelada com sucesso!');
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
      
      // Refresh bookings
      await fetchPlayerData();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Erro ao cancelar reserva');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await challengesService.updateChallengeStatus(challengeId, 'accepted');
      toast.success('Convite aceito!');
      await fetchPlayerData();
    } catch (error) {
      toast.error('Erro ao aceitar convite');
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    try {
      await challengesService.updateChallengeStatus(challengeId, 'declined');
      toast.success('Convite recusado');
      await fetchPlayerData();
    } catch (error) {
      toast.error('Erro ao recusar convite');
    }
  };

  const handleOpenReportResult = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const isChallenger = challenge.challenger_id === user?.id;
    const opponentProfile = isChallenger ? challenge.challenged_profile : challenge.challenger_profile;
    
    setReportResultModal({
      isOpen: true,
      challengeId,
      opponentName: opponentProfile?.full_name || 'Oponente'
    });
  };

  const handleReportResult = async (resultData: {
    challengeId: string;
    result: 'win' | 'loss';
    score: string;
    notes?: string;
  }) => {
    await challengesService.reportResult(
      resultData.challengeId,
      resultData.result,
      resultData.score,
      resultData.notes
    );
    await fetchPlayerData();
    setReportResultModal({ isOpen: false, challengeId: '', opponentName: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Minha Área
              </h1>
              <p className="text-gray-600">
                Olá, {user?.name}! Gerencie suas reservas e acompanhe sua atividade.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                <Link to="/courts">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reserva
                </Link>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddMatchModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Partida
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{matchHistory.length}</div>
                <p className="text-xs text-muted-foreground">
                  de {bookings.length} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Jogos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUpcomingGames}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingBookings.length} reservas + {acceptedChallenges.length} desafios
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  em {bookings.length} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modalidade Favorita</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Tênis</div>
                <p className="text-xs text-muted-foreground">
                  esporte mais jogado
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-auto w-full grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-start p-2">
              <TabsTrigger value="games" className="flex-1 min-w-0">
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Próximos Jogos</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex-1 min-w-0">
                <Clock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Próximas Reservas</span>
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex-1 min-w-0">
                <Target className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Meus Créditos</span>
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex-1 min-w-0">
                <Trophy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Meus Torneios</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex-1 min-w-0">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Amigos</span>
              </TabsTrigger>
              <TabsTrigger value="leagues" className="flex-1 min-w-0">
                <Shield className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ligas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                onClick={(e) => {
                  e.preventDefault();
                  setComingSoonFeature('Mensagens');
                  setShowComingSoonModal(true);
                }}
                className="flex-1 min-w-0"
              >
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mensagens</span>
                <Badge variant="outline" className="hidden lg:inline-flex ml-2 text-xs bg-gray-100 text-gray-600 border-gray-300">
                  Em Breve
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 min-w-0">
                <Activity className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 min-w-0">
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Meu Perfil</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="space-y-6">
              <ChallengesCard
                challenges={challenges}
                currentUserId={user?.id || ''}
                onAccept={handleAcceptChallenge}
                onDecline={handleDeclineChallenge}
                onReportResult={handleOpenReportResult}
                loading={challengesLoading}
              />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Reservas
                  </CardTitle>
                  <CardDescription>
                    Suas reservas confirmadas nos próximos dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{booking.courts.name}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.courts.location}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.booking_date} • {booking.start_time}-{booking.end_time} • {booking.courts.sport_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">R$ {booking.total_price}</p>
                            <div className="space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(booking)}
                              >
                                Detalhes
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancelClick(booking)}
                                disabled={booking.status === 'cancelled'}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma reserva próxima
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Que tal reservar uma quadra para jogar?
                      </p>
                      <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                        <Link to="/courts">
                          <Plus className="h-4 w-4 mr-2" />
                          Fazer Nova Reserva
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credits" className="space-y-6">
              <BookingCreditsDisplay />
            </TabsContent>

            <TabsContent value="tournaments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Meus Torneios
                  </CardTitle>
                  <CardDescription>
                    Torneios em que você está inscrito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tournamentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : tournaments.length > 0 ? (
                    <div className="space-y-4">
                      {tournaments.map((registration: any) => {
                        const tournament = registration.tournaments;
                        if (!tournament) return null;

                        const isOrganizer = registration.is_organizer || registration.payment_status === 'organizer';

                        return (
                          <div key={registration.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{tournament.name}</h3>
                                  {isOrganizer && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                      <User className="h-3 w-3 mr-1" />
                                      Organizador
                                    </Badge>
                                  )}
                                </div>
                                {tournament.tournament_code && (
                                  <p className="text-xs font-mono text-gray-500 mb-1">
                                    Código: {tournament.tournament_code}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {tournament.location}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(tournament.start_date).toLocaleDateString('pt-BR')} - {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={
                                  tournament.status === 'upcoming' ? 'default' :
                                  tournament.status === 'in_progress' ? 'secondary' :
                                  'outline'
                                }>
                                  {tournament.status === 'upcoming' ? 'Próximo' :
                                   tournament.status === 'in_progress' ? 'Em Andamento' :
                                   'Finalizado'}
                                </Badge>
                                {!isOrganizer && (
                                  <Badge variant={
                                    registration.payment_status === 'paid' ? 'default' : 'outline'
                                  }>
                                    {registration.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {tournament.bracket_generated && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-green-600 font-medium flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Chave do torneio gerada
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex gap-2">
                              <Button 
                                asChild
                                variant="outline" 
                                size="sm"
                              >
                                <Link to={`/tournaments/${tournament.id}`}>
                                  Ver Detalhes
                                </Link>
                              </Button>
                              {tournament.bracket_generated && (
                                <Button 
                                  asChild
                                  size="sm"
                                  className="bg-tennis-blue hover:bg-tennis-blue-dark"
                                >
                                  <Link to={`/tournaments/${tournament.id}?tab=bracket`}>
                                    Ver Chave
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum torneio inscrito
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Explore torneios disponíveis e participe!
                      </p>
                      <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                        <Link to="/tournaments">
                          <Trophy className="h-4 w-4 mr-2" />
                          Ver Torneios
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">🛠️ Esta funcionalidade estará disponível em breve!</h3>
                  <p className="text-muted-foreground">
                    A equipe Kourtify está trabalhando para liberar o sistema de <strong>Mensagens</strong> nas próximas atualizações.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="friends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Amigos
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas amizades e encontre novos parceiros de jogo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FriendsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leagues" className="space-y-6">
              <LeaguesManager />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas de Desempenho
                  </CardTitle>
                  <CardDescription>
                    Seu desempenho e análise de resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-green-600">{wins}</p>
                        <p className="text-sm text-gray-600">Vitórias</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-red-600">{losses}</p>
                        <p className="text-sm text-gray-600">Derrotas</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-blue-600">{winRate}%</p>
                        <p className="text-sm text-gray-600">Taxa de Vitórias</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Jogos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Histórico de Partidas
                  </CardTitle>
                  <CardDescription>
                    Todas as suas partidas registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {matchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {matchHistory.map((match) => (
                        <div key={match.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">vs {match.opponent_name}</h3>
                                <Badge variant={match.result === 'vitória' ? 'default' : 'destructive'} className={match.result === 'vitória' ? 'bg-green-100 text-green-800' : ''}>
                                  {match.result === 'vitória' ? <Trophy className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                  {match.result === 'vitória' ? 'Vitória' : 'Derrota'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center mb-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(match.match_date).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {match.sport_type} {match.court_name ? `• ${match.court_name}` : ''}
                              </p>
                              {match.duration_minutes && (
                                <p className="text-xs text-gray-400 mt-1">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  Duração: {match.duration_minutes} min
                                </p>
                              )}
                              {match.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  "{match.notes}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-tennis-blue">{match.score || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma partida registrada
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Comece a registrar suas partidas para acompanhar seu desempenho
                      </p>
                      <Button 
                        onClick={() => setIsAddMatchModalOpen(true)}
                        className="bg-tennis-blue hover:bg-tennis-blue-dark"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Primeira Partida
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </CardTitle>
                  <CardDescription>
                    Informações pessoais e configurações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        <p className="text-gray-900">{profile?.full_name || user?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{profile?.email || user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nível de Habilidade</label>
                        <p className="text-gray-900">{profile?.skill_level || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Localização</label>
                        <p className="text-gray-900">{profile?.location || 'Não informada'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Telefone</label>
                        <p className="text-gray-900">{profile?.phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mão Dominante</label>
                        <p className="text-gray-900">{profile?.dominant_hand || 'Não informado'}</p>
                      </div>
                    </div>
                    {profile?.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Biografia</label>
                        <p className="text-gray-900 mt-1">{profile.bio}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/player/profile')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagens
                  </CardTitle>
                  <CardDescription>
                    Converse com outros jogadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatInterface />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      
      <AddMatchModal 
        isOpen={isAddMatchModalOpen}
        onClose={() => setIsAddMatchModalOpen(false)}
        onMatchAdded={() => {
          setIsAddMatchModalOpen(false);
          fetchPlayerData();
        }}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <ReportResultModal
        isOpen={reportResultModal.isOpen}
        onClose={() => setReportResultModal({ isOpen: false, challengeId: '', opponentName: '' })}
        challengeId={reportResultModal.challengeId}
        opponentName={reportResultModal.opponentName}
        onSubmit={handleReportResult}
      />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva?
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Política de cancelamento:</strong> Cancelamentos com menos de 24 horas de antecedência não são reembolsáveis.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />

      {/* Modal Em Breve */}
      <AlertDialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              🛠️ Funcionalidade em Desenvolvimento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              A funcionalidade de <strong>{comingSoonFeature}</strong> estará disponível em breve!
              <br /><br />
              A equipe Kourtify está trabalhando para liberar este recurso nas próximas atualizações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowComingSoonModal(false)}>
              Voltar para Minha Área
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlayerDashboard;