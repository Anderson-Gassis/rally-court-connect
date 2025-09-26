import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCourts } from '@/hooks/useCourts';

const PartnerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: courts = [], isLoading } = useCourts();

  // Mock data for demonstration - replace with real data from Supabase
  const dashboardStats = {
    totalCourts: courts.length,
    activeCourts: courts.filter(c => c.available).length,
    totalBookings: 45,
    confirmedBookings: 38,
    totalRevenue: 12500,
    averageRating: 4.6,
  };

  const recentBookings = [
    {
      id: '1',
      courtName: 'Quadra Principal',
      customerName: 'João Silva',
      date: '2024-01-15',
      time: '10:00-11:00',
      price: 80,
      status: 'confirmed'
    },
    {
      id: '2',
      courtName: 'Quadra Coberta',
      customerName: 'Maria Santos',
      date: '2024-01-15',
      time: '14:00-15:00', 
      price: 100,
      status: 'pending'
    },
    {
      id: '3',
      courtName: 'Quadra Beach Tennis',
      customerName: 'Pedro Costa',
      date: '2024-01-16',
      time: '09:00-10:00',
      price: 60,
      status: 'confirmed'
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
                Você precisa estar logado como parceiro para acessar esta área.
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard do Parceiro
              </h1>
              <p className="text-gray-600">
                Bem-vindo de volta, {user?.name}! Gerencie suas quadras e acompanhe seu desempenho.
              </p>
            </div>
            <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
              <Link to="/add-court">
                <Plus className="h-4 w-4 mr-2" />
                Nova Quadra
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Quadras</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalCourts}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.activeCourts} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas Confirmadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.confirmedBookings}</div>
                <p className="text-xs text-muted-foreground">
                  de {dashboardStats.totalBookings} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {dashboardStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.averageRating}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= dashboardStats.averageRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
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
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{booking.courtName}</p>
                            <p className="text-sm text-gray-600">{booking.customerName}</p>
                            <p className="text-xs text-gray-500">
                              {booking.date} • {booking.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {booking.price}</p>
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
                  {isLoading ? (
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
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm">{court.rating}</span>
                              </div>
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
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{booking.courtName}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-gray-600">{booking.customerName}</p>
                          <p className="text-sm text-gray-500">
                            {booking.date} • {booking.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">R$ {booking.price}</p>
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