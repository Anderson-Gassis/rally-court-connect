
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
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPlayersRanking();
  }, []);

  const fetchPlayersRanking = async () => {
    try {
      // Fetch profiles with match history stats
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          match_history!match_history_player_id_fkey(result)
        `)
        .eq('role', 'player');

      if (error) throw error;

      // Calculate ranking stats
      const playersWithStats = profiles.map((profile: any) => {
        const matches = profile.match_history || [];
        const totalMatches = matches.length;
        const wins = matches.filter((m: any) => m.result === 'win').length;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        const points = wins * 10 + totalMatches * 2; // Simple scoring system

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

      // Sort by points and add ranking
      const rankedPlayers = playersWithStats
        .sort((a, b) => b.points - a.points)
        .map((player, index) => ({ ...player, rank: index + 1 }));

      setPlayers(rankedPlayers);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast.error('Erro ao carregar rankings');
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback mock data if no real data
  const players = [
    { 
      id: '1', 
      rank: 1, 
      name: 'Carlos Almeida', 
      nickname: 'CarlosTennis', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
      level: 'Avançado', 
      region: 'São Paulo', 
      matches: 102, 
      winRate: 87, 
      points: 1450 
    },
    { 
      id: '2', 
      rank: 2, 
      name: 'Ana Costa', 
      nickname: 'AnaAce', 
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=500',
      level: 'Intermediário', 
      region: 'Rio de Janeiro', 
      matches: 84, 
      winRate: 81, 
      points: 1380 
    },
    { 
      id: '3', 
      rank: 3, 
      name: 'Lucas Silva', 
      nickname: 'LucasSmash', 
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=500',
      level: 'Avançado', 
      region: 'São Paulo', 
      matches: 76, 
      winRate: 78, 
      points: 1290 
    },
    { 
      id: '4', 
      rank: 4, 
      name: 'Marina Santos', 
      nickname: 'MarinaSlice', 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500',
      level: 'Profissional', 
      region: 'Minas Gerais', 
      matches: 120, 
      winRate: 75, 
      points: 1250 
    },
    { 
      id: '5', 
      rank: 5, 
      name: 'Paulo Mendes', 
      nickname: 'PauloServe', 
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=500',
      level: 'Avançado', 
      region: 'Paraná', 
      matches: 68, 
      winRate: 72, 
      points: 1180 
    },
    { 
      id: '6', 
      rank: 6, 
      name: 'Rafael Silva', 
      nickname: 'RafaTennis', 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500',
      level: 'Intermediário', 
      region: 'São Paulo', 
      matches: 47, 
      winRate: 68, 
      points: 950 
    },
    { 
      id: '7', 
      rank: 7, 
      name: 'Juliana Martins', 
      nickname: 'JuliTennis', 
      image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=500',
      level: 'Iniciante', 
      region: 'Santa Catarina', 
      matches: 32, 
      winRate: 62, 
      points: 780 
    },
    { 
      id: '8', 
      rank: 8, 
      name: 'Bruno Costa', 
      nickname: 'BrunoBackhand', 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500',
      level: 'Avançado', 
      region: 'Rio de Janeiro', 
      matches: 56, 
      winRate: 64, 
      points: 740 
    },
    { 
      id: '9', 
      rank: 9, 
      name: 'Carla Oliveira', 
      nickname: 'CarlaForehand', 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500',
      level: 'Intermediário', 
      region: 'São Paulo', 
      matches: 38, 
      winRate: 58, 
      points: 680 
    },
    { 
      id: '10', 
      rank: 10, 
      name: 'Diego Santos', 
      nickname: 'DiegoVolley', 
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=500',
      level: 'Iniciante', 
      region: 'Bahia', 
      matches: 25, 
      winRate: 52, 
      points: 520 
    },
  ];
  
  // Filter players based on search and filters
  const filteredPlayers = players.filter(player => {
    const matchesRegion = regionFilter === 'all' || player.region === regionFilter;
    const matchesCategory = categoryFilter === 'all' || player.level === categoryFilter;
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         player.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRegion && matchesCategory && matchesSearch;
  });
  
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
                    <SelectItem value="Paraná">Paraná</SelectItem>
                    <SelectItem value="Santa Catarina">Santa Catarina</SelectItem>
                    <SelectItem value="Bahia">Bahia</SelectItem>
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
                        <Link to={`/players/${player.id}`} className="flex items-center hover:text-tennis-blue">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
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
                        <Link to={`/players/${player.id}`} className="flex items-center hover:text-tennis-blue">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
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
                        <Link to={`/players/${player.id}`} className="flex items-center hover:text-tennis-blue">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={player.image} alt={player.name} />
                            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{player.name}</div>
                            <div className="text-xs text-gray-500">{player.nickname}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>{player.region}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                      <TableCell className="text-right">{player.winRate}%</TableCell>
                      <TableCell className="text-right font-medium">{player.points}</TableCell>
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
