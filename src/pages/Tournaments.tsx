
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, Search, Plus } from "lucide-react";

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data for tournaments
  const tournaments = [
    {
      id: '1',
      name: 'Copa São Paulo de Tênis 2025',
      image: 'https://images.unsplash.com/photo-1595435934824-1bef2e389342?q=80&w=500',
      location: 'Clube Atlético Paulistano, São Paulo',
      startDate: '15/06/2025',
      endDate: '22/06/2025',
      category: 'Avançado',
      format: 'Eliminação simples',
      status: 'upcoming',
      players: 32,
      prize: 'R$ 5.000',
      organizer: 'Federação Paulista de Tênis'
    },
    {
      id: '2',
      name: 'Torneio Aberto Moema',
      image: 'https://images.unsplash.com/photo-1620742820748-87c09249a72a?q=80&w=500',
      location: 'Tennis Park, Moema, São Paulo',
      startDate: '10/07/2025',
      endDate: '12/07/2025',
      category: 'Intermediário',
      format: 'Round Robin + Eliminatórias',
      status: 'upcoming',
      players: 24,
      prize: 'R$ 2.000',
      organizer: 'Tennis Park'
    },
    {
      id: '3',
      name: 'Desafio de Verão - Rio',
      image: 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500',
      location: 'Clube Fluminense, Rio de Janeiro',
      startDate: '05/01/2026',
      endDate: '10/01/2026',
      category: 'Todos os níveis',
      format: 'Grupos + Eliminatórias',
      status: 'upcoming',
      players: 48,
      prize: 'R$ 3.500',
      organizer: 'Confederação Brasileira de Tênis'
    },
    {
      id: '4',
      name: 'Copa Kourtify de Iniciantes',
      image: 'https://images.unsplash.com/photo-1614743758466-e569f4791116?q=80&w=500',
      location: 'Academia Ace, São Paulo',
      startDate: '20/05/2025',
      endDate: '22/05/2025',
      category: 'Iniciante',
      format: 'Grupos',
      status: 'upcoming',
      players: 16,
      prize: 'Premiação em produtos',
      organizer: 'Kourtify.com'
    },
    {
      id: '5',
      name: 'Campeonato Brasileiro Universitário',
      image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=500',
      location: 'USP, São Paulo',
      startDate: '10/08/2025',
      endDate: '15/08/2025',
      category: 'Universitário',
      format: 'Eliminação dupla',
      status: 'upcoming',
      players: 64,
      prize: 'R$ 10.000',
      organizer: 'Confederação Brasileira de Desporto Universitário'
    },
    {
      id: '6',
      name: 'Torneio Master 40+',
      image: 'https://images.unsplash.com/photo-1622279488885-c9ab5396a402?q=80&w=500',
      location: 'Tênis Clube Paulista, São Paulo',
      startDate: '12/09/2025',
      endDate: '14/09/2025',
      category: 'Master (40+)',
      format: 'Eliminação simples',
      status: 'upcoming',
      players: 24,
      prize: 'R$ 3.000',
      organizer: 'Tênis Clube Paulista'
    },
    {
      id: '7',
      name: 'Copa Outono - Saibro',
      image: 'https://images.unsplash.com/photo-1569955914862-7d551e5516a1?q=80&w=500',
      location: 'Clube Atlético Paulistano, São Paulo',
      startDate: '15/04/2025',
      endDate: '20/04/2025',
      category: 'Avançado',
      format: 'Eliminação simples',
      status: 'completed',
      players: 32,
      prize: 'R$ 5.000',
      organizer: 'Federação Paulista de Tênis',
      winner: 'Carlos Almeida'
    },
    {
      id: '8',
      name: 'Torneio de Duplas da Primavera',
      image: 'https://images.unsplash.com/photo-1614743758466-e569f4791116?q=80&w=500',
      location: 'Tennis Park, Moema, São Paulo',
      startDate: '22/03/2025',
      endDate: '23/03/2025',
      category: 'Todos os níveis',
      format: 'Eliminação simples',
      status: 'completed',
      players: 16,
      prize: 'R$ 2.000',
      organizer: 'Tennis Park',
      winner: 'Dupla: Ana Costa / Marina Santos'
    },
  ];
  
  // Filter tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tournament.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tournament.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Split tournaments by status
  const upcomingTournaments = filteredTournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 mr-3">Torneios</h1>
              <Trophy className="h-8 w-8 text-tennis-blue" />
            </div>
            
            <Button className="bg-tennis-blue hover:bg-tennis-blue-dark">
              <Plus className="mr-2 h-4 w-4" />
              Criar Torneio
            </Button>
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar torneios..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
                <SelectItem value="Todos os níveis">Todos os níveis</SelectItem>
                <SelectItem value="Master (40+)">Master (40+)</SelectItem>
                <SelectItem value="Universitário">Universitário</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="upcoming">Próximos</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upcoming">Próximos Torneios</TabsTrigger>
              <TabsTrigger value="completed">Torneios Concluídos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map((tournament) => (
                  <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="block">
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={tournament.image} 
                          alt={tournament.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <Badge className="w-fit bg-tennis-blue mb-2">{tournament.category}</Badge>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>{tournament.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.startDate} - {tournament.endDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Prêmio: {tournament.prize}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.players} jogadores</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button className="w-full bg-tennis-blue hover:bg-tennis-blue-dark">
                          Inscrever-se
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.map((tournament) => (
                  <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="block">
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={tournament.image} 
                          alt={tournament.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <Badge className="w-fit bg-gray-500 mb-2">{tournament.category}</Badge>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>{tournament.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.startDate} - {tournament.endDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                            <span>Vencedor: {tournament.winner}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.players} jogadores</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button variant="outline" className="w-full">
                          Ver Resultados
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tournaments;
