import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PlayerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Mock data for demonstration - replace with real data from Supabase
  const playerStats = {
    totalBookings: 28,
    completedGames: 24,
    upcomingBookings: 2,
    cancelledBookings: 2,
    favoriteSpot: 'Tênis',
    totalSpent: 2240,
    averageRating: 4.8,
  };

  const upcomingBookings = [
    {
      id: '1',
      courtName: 'Clube Atlético Paulistano',
      courtType: 'Saibro',
      date: '2024-01-16',
      time: '10:00-11:00',
      price: 80,
      status: 'confirmed',
      location: 'Jardins, São Paulo'
    },
    {
      id: '2',
      courtName: 'Tennis Park',
      courtType: 'Rápida',
      date: '2024-01-18',
      time: '14:00-15:00',
      price: 60,
      status: 'confirmed',
      location: 'Moema, São Paulo'
    }
  ];

  const recentGames = [
    {
      id: '1',
      courtName: 'Arena Beach Sports',
      courtType: 'Areia',
      date: '2024-01-12',
      time: '09:00-10:00',
      price: 70,
      status: 'completed',
      rating: 5
    },
    {
      id: '2',
      courtName: 'Padel Center',
      courtType: 'Vidro',
      date: '2024-01-10',
      time: '16:00-17:00',
      price: 90,
      status: 'completed',
      rating: 4
    },
    {
      id: '3',
      courtName: 'Tennis Park',
      courtType: 'Rápida',
      date: '2024-01-08',
      time: '11:00-12:00',
      price: 60,
      status: 'cancelled',
      rating: null
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa estar logado para acessar sua área pessoal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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
            <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
              <Link to="/courts">
                <Plus className="h-4 w-4 mr-2" />
                Nova Reserva
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.completedGames}</div>
                <p className="text-xs text-muted-foreground">
                  de {playerStats.totalBookings} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Jogos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.upcomingBookings}</div>
                <p className="text-xs text-muted-foreground">
                  reservas confirmadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {playerStats.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  em {playerStats.totalBookings} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modalidade Favorita</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.favoriteSpot}</div>
                <p className="text-xs text-muted-foreground">
                  esporte mais jogado
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Próximos Jogos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
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
                              <h3 className="font-semibold">{booking.courtName}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-sm text-gray-600 flex items-center mb-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.location}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {booking.date} • {booking.time} • {booking.courtType}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">R$ {booking.price}</p>
                            <div className="space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                Detalhes
                              </Button>
                              <Button variant="destructive" size="sm">
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

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Jogos</CardTitle>
                  <CardDescription>
                    Todas as suas reservas anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGames.map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{game.courtName}</h3>
                            {getStatusBadge(game.status)}
                          </div>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {game.date} • {game.time} • {game.courtType}
                          </p>
                          {game.rating && (
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600 mr-1">Sua avaliação:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= game.rating!
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">R$ {game.price}</p>
                          {game.status === 'completed' && !game.rating && (
                            <Button variant="outline" size="sm" className="mt-2">
                              Avaliar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    Gerencie suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        <p className="text-gray-900">{user?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nível de Habilidade</label>
                        <p className="text-gray-900">{user?.skillLevel || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Localização</label>
                        <p className="text-gray-900">{user?.location || 'Não informada'}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline">
                        Editar Perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quadras Favoritas</CardTitle>
                  <CardDescription>
                    Suas quadras preferidas para acesso rápido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma quadra favorita ainda
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Favorite quadras durante a navegação para acesso rápido aqui.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/courts">
                        Explorar Quadras
                      </Link>
                    </Button>
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

export default PlayerDashboard;