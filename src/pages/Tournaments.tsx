import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import TournamentPaymentButton from '@/components/TournamentPaymentButton';

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournamentsList(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Erro ao carregar torneios');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter tournaments
  const filteredTournaments = tournamentsList.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tournament.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tournament.sport_type === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Split tournaments by status
  const upcomingTournaments = filteredTournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando torneios...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
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
                <SelectValue placeholder="Filtrar por esporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os esportes</SelectItem>
                <SelectItem value="Tênis">Tênis</SelectItem>
                <SelectItem value="Padel">Padel</SelectItem>
                <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
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
                {upcomingTournaments.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum torneio encontrado
                    </h3>
                    <p className="text-gray-600">
                      Não há torneios próximos no momento.
                    </p>
                  </div>
                ) : (
                  upcomingTournaments.map((tournament) => (
                    <Card key={tournament.id} className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge className="w-fit bg-tennis-blue mb-2">{tournament.sport_type}</Badge>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>{tournament.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span>
                              {new Date(tournament.start_date).toLocaleDateString('pt-BR')} - {' '}
                              {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Taxa: R$ {(tournament.entry_fee / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.max_participants} jogadores</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <TournamentPaymentButton
                          tournamentId={tournament.id}
                          tournamentName={tournament.name}
                          entryFee={tournament.entry_fee}
                        />
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum torneio concluído
                    </h3>
                    <p className="text-gray-600">
                      Não há torneios concluídos para mostrar.
                    </p>
                  </div>
                ) : (
                  completedTournaments.map((tournament) => (
                    <Card key={tournament.id} className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge className="w-fit bg-gray-500 mb-2">{tournament.sport_type}</Badge>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>{tournament.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span>
                              {new Date(tournament.start_date).toLocaleDateString('pt-BR')} - {' '}
                              {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{tournament.max_participants} jogadores</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button variant="outline" className="w-full">
                          Ver Resultados
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
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