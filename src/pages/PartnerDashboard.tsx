import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Plus, 
  Star, 
  TrendingUp,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PartnerProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface PartnerInfo {
  business_name?: string;
  business_type?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  website_url?: string;
  business_address?: string;
  verified: boolean;
}

interface Court {
  id: string;
  name: string;
  sport_type: string;
  type: string;
  location: string;
  price_per_hour: number;
  available: boolean;
  image_url?: string;
  created_at: string;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  payment_status: string;
  user_id: string;
  court_id: string;
  courts: {
    name: string;
  };
  profiles: {
    full_name: string;
  };
}

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aguardar o loading terminar antes de verificar autenticação
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Só redirecionar se o user estiver carregado E não for partner
    if (user && user.role && user.role !== 'partner') {
      navigate('/');
      toast.error('Acesso restrito a parceiros');
      return;
    }

    // Só buscar dados se o user estiver completamente carregado
    if (user && user.role) {
      fetchPartnerData();
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const fetchPartnerData = async () => {
    if (!user) return;

    try {
      // Buscar perfil do parceiro
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Buscar informações do parceiro
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (partnerError && partnerError.code !== 'PGRST116') throw partnerError;
      setPartnerInfo(partnerData);

      // Buscar quadras do parceiro
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (courtsError) throw courtsError;
      setCourts(courtsData || []);

      // Buscar reservas das quadras do parceiro
      if (courtsData && courtsData.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            courts!inner(name)
          `)
          .in('court_id', courtsData.map(court => court.id))
          .order('booking_date', { ascending: false })
          .limit(20);

        if (bookingsError) throw bookingsError;
        
        // Buscar nomes dos usuários separadamente
        const bookingsWithUsers = await Promise.all(
          (bookingsData || []).map(async (booking) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', booking.user_id)
              .single();
            
            return {
              ...booking,
              profiles: userData || { full_name: 'Usuário não encontrado' }
            };
          })
        );
        
        setBookings(bookingsWithUsers);
      }

    } catch (error) {
      console.error('Error fetching partner data:', error);
      toast.error('Erro ao carregar dados do parceiro');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'partner') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa estar logado como parceiro para acessar esta área.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
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

  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const activeCourts = courts.filter(court => court.available).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
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
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {partnerInfo?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {partnerInfo?.business_name || profile?.full_name || user?.name}
                </h1>
                <p className="text-gray-600">{profile?.email || user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  {partnerInfo?.verified ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pendente Verificação
                    </Badge>
                  )}
                  {partnerInfo?.business_type && (
                    <Badge variant="outline">{partnerInfo.business_type}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/partner/profile')}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button onClick={() => navigate('/add-court')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Quadra
              </Button>
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quadras Ativas</p>
                    <p className="text-2xl font-bold">{activeCourts}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reservas Confirmadas</p>
                    <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingBookings.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Faturamento</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="courts">Minhas Quadras</TabsTrigger>
              <TabsTrigger value="bookings">Reservas</TabsTrigger>
              <TabsTrigger value="analytics">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Reservas Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimas reservas nas suas quadras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{booking.courts.name}</p>
                            <p className="text-sm text-gray-600">{booking.profiles.full_name}</p>
                            <p className="text-xs text-gray-500">
                              {booking.booking_date} • {booking.start_time}-{booking.end_time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {booking.total_price.toFixed(2)}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                      Gerencie suas quadras rapidamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/add-court">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Nova Quadra
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/partner/bookings">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Todas as Reservas
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/partner/profile">
                        <Users className="h-4 w-4 mr-2" />
                        Editar Perfil do Negócio
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/partner/analytics">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Relatórios Detalhados
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courts" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Suas Quadras</CardTitle>
                    <CardDescription>
                      Gerencie todas as suas quadras cadastradas
                    </CardDescription>
                  </div>
                  <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                    <Link to="/add-court">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Quadra
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                          <div className="bg-gray-200 h-16 w-16 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : courts.length > 0 ? (
                    <div className="space-y-4">
                      {courts.map((court) => (
                        <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={court.image_url || 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=100'} 
                              alt={court.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div>
                              <h3 className="font-semibold">{court.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {court.location}
                              </p>
                              <p className="text-sm text-gray-500">
                                {court.type} • {court.sport_type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {court.price_per_hour}/hora</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={court.available ? "default" : "secondary"} className="text-xs">
                                {court.available ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma quadra cadastrada
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Comece cadastrando sua primeira quadra para receber reservas.
                      </p>
                      <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                        <Link to="/add-court">
                          <Plus className="h-4 w-4 mr-2" />
                          Cadastrar Primeira Quadra
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Reservas</CardTitle>
                  <CardDescription>
                    Histórico completo de reservas nas suas quadras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{booking.courts.name}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-gray-600">{booking.profiles.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {booking.booking_date} • {booking.start_time}-{booking.end_time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">R$ {booking.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios e Análises</CardTitle>
                  <CardDescription>
                    Insights sobre o desempenho das suas quadras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Relatórios em Desenvolvimento
                    </h3>
                    <p className="text-gray-600">
                      Em breve você terá acesso a relatórios detalhados sobre ocupação, 
                      receita e performance das suas quadras.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartnerDashboard;