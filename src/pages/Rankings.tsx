import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Trophy, Star, Search } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ChallengePlayerButton from '@/components/ChallengePlayerButton';

const Rankings = () => {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPlayersRanking();
  }, []);

  const fetchPlayersRanking = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          match_history!match_history_player_id_fkey(result)
        `)
        .eq('role', 'player');

      if (error) throw error;

      const playersWithStats = profiles.map((profile: any) => {
        const matches = profile.match_history || [];
        const totalMatches = matches.length;
        const wins = matches.filter((m: any) => m.result === 'vitória').length;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        
        // Use ranking_points from profile (updated by rankingService)
        const points = profile.ranking_points || 0;

        return {
          id: profile.user_id,
          name: profile.full_name || 'Jogador',
          nickname: profile.full_name?.split(' ')[0] || 'Player',
          image: profile.avatar_url,
          level: profile.skill_level || 'Iniciante',
          region: profile.location || 'São Paulo',
          matches: totalMatches,
          winRate,
          points,
        };
      });

      const rankedPlayers = playersWithStats
        .sort((a, b) => b.points - a.points)
        .map((player, index) => ({ ...player, rank: index + 1 }));

      setPlayersList(rankedPlayers);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast.error('Erro ao carregar rankings');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter players based on search and filters
  const filteredPlayers = playersList.filter(player => {
    const matchesRegion = regionFilter === 'all' || player.region === regionFilter;
    const matchesCategory = categoryFilter === 'all' || player.level === categoryFilter;
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         player.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRegion && matchesCategory && matchesSearch;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando rankings...</p>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rankings</h1>
            <Trophy className="h-8 w-8 text-tennis-blue" />
          </div>
          
          <Tabs defaultValue="global">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="global">Ranking Global</TabsTrigger>
              <TabsTrigger value="regional">Ranking Regional</TabsTrigger>
              <TabsTrigger value="category">Por Categoria</TabsTrigger>
            </TabsList>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/3 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar jogadores..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="sm:w-1/3">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regiões</SelectItem>
                    <SelectItem value="São Paulo">São Paulo</SelectItem>
                    <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                    <SelectItem value="Minas Gerais">Minas Gerais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:w-1/3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                    <SelectItem value="Profissional">Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="global">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posição</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead className="text-right">Partidas</TableHead>
                    <TableHead className="text-right">Taxa de Vitória</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        {player.rank <= 3 ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {player.rank}
                          </div>
                        ) : (
                          player.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
                      <TableCell className="text-right">
                        <ChallengePlayerButton 
                          playerId={player.id}
                          playerName={player.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="regional">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posição</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead className="text-right">Partidas</TableHead>
                    <TableHead className="text-right">Taxa de Vitória</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers
                    .sort((a, b) => {
                      if (a.region === b.region) {
                        return b.points - a.points;
                      }
                      return a.region.localeCompare(b.region);
                    })
                    .map((player, index) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
                      <TableCell className="text-right">
                        <ChallengePlayerButton 
                          playerId={player.id}
                          playerName={player.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="category">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posição</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead className="text-right">Partidas</TableHead>
                    <TableHead className="text-right">Taxa de Vitória</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers
                    .sort((a, b) => {
                      if (a.level === b.level) {
                        return b.points - a.points;
                      }
                      return a.level.localeCompare(b.level);
                    })
                    .map((player, index) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
                      <TableCell className="text-right">
                        <ChallengePlayerButton 
                          playerId={player.id}
                          playerName={player.name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Rankings;