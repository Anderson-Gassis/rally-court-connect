
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Award, Flag, Star } from "lucide-react";
import ChallengePlayerButton from '@/components/ChallengePlayerButton';

const PlayerProfile = () => {
  const { id } = useParams();
  
  // Mock player data - in a real app, you would fetch this data based on the ID
  const player = {
    id: id || '1',
    name: 'Rafael Silva',
    nickname: 'RafaTennis',
    level: 'Intermediário',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500',
    location: 'São Paulo, SP',
    joinDate: '11/2023',
    winRate: 68,
    ranking: {
      global: 156,
      regional: 23,
      levelBased: 15
    },
    stats: {
      matches: 47,
      wins: 32,
      losses: 15,
      tournamentsWon: 3,
      tournamentsJoined: 8
    },
    badges: [
      { name: 'Rei do Saibro', description: '10 vitórias em quadras de saibro' },
      { name: 'Iniciante Promissor', description: 'Ganhou 5 partidas seguidas como iniciante' },
      { name: 'Maratonista', description: 'Participou de 3 torneios em um mês' }
    ],
    matchHistory: [
      { id: 'm1', date: '12/05/2025', opponent: 'Carlos Mendes', result: 'Vitória', score: '6-4, 6-2', courtName: 'Clube Atlético Paulistano' },
      { id: 'm2', date: '05/05/2025', opponent: 'Lucas Ferreira', result: 'Derrota', score: '3-6, 4-6', courtName: 'Tennis Park' },
      { id: 'm3', date: '27/04/2025', opponent: 'Guilherme Santos', result: 'Vitória', score: '6-3, 7-5', courtName: 'Condomínio Green Park' },
      { id: 'm4', date: '15/04/2025', opponent: 'André Martins', result: 'Vitória', score: '6-1, 6-1', courtName: 'Clube Atlético Paulistano' },
      { id: 'm5', date: '02/04/2025', opponent: 'Marcelo Costa', result: 'Derrota', score: '6-7, 4-6', courtName: 'Tennis Park' }
    ]
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Player Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 border-4 border-tennis-blue">
                <AvatarImage src={player.image} alt={player.name} />
                <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{player.nickname}</Badge>
                  <Badge className="bg-tennis-blue">{player.level}</Badge>
                  <Badge variant="secondary">{player.location}</Badge>
                </div>
                <p className="text-gray-500 mt-2">Membro desde {player.joinDate}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ChallengePlayerButton playerId={player.id} />
              <Button variant="outline">
                Seguir
              </Button>
              <Button variant="outline">
                Mensagem
              </Button>
            </div>
          </div>
          
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Taxa de Vitórias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{player.winRate}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Ranking Global</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-tennis-blue" />
                <div className="text-2xl font-bold">#{player.ranking.global}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Ranking Regional</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <Flag className="mr-2 h-4 w-4 text-tennis-blue" />
                <div className="text-2xl font-bold">#{player.ranking.regional}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Torneios Vencidos</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <Award className="mr-2 h-4 w-4 text-tennis-blue" />
                <div className="text-2xl font-bold">{player.stats.tournamentsWon}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tab Content */}
          <Tabs defaultValue="history" className="mt-6">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="badges">Conquistas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Partidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Adversário</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Placar</TableHead>
                        <TableHead>Quadra</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {player.matchHistory.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>{match.date}</TableCell>
                          <TableCell>{match.opponent}</TableCell>
                          <TableCell>
                            <Badge className={match.result === 'Vitória' ? 'bg-green-500' : 'bg-red-500'}>
                              {match.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{match.score}</TableCell>
                          <TableCell>{match.courtName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Partidas jogadas</span>
                        <span className="font-medium">{player.stats.matches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vitórias</span>
                        <span className="font-medium">{player.stats.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Derrotas</span>
                        <span className="font-medium">{player.stats.losses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de vitória</span>
                        <span className="font-medium">{player.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Torneios disputados</span>
                        <span className="font-medium">{player.stats.tournamentsJoined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Torneios vencidos</span>
                        <span className="font-medium">{player.stats.tournamentsWon}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Global</span>
                        <span className="font-medium">#{player.ranking.global}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Regional (São Paulo)</span>
                        <span className="font-medium">#{player.ranking.regional}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Na categoria (Intermediário)</span>
                        <span className="font-medium">#{player.ranking.levelBased}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="badges">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {player.badges.map((badge, index) => (
                  <Card key={index}>
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto bg-tennis-blue-light p-4 rounded-full mb-4">
                        <Award className="h-10 w-10 text-tennis-blue" />
                      </div>
                      <CardTitle>{badge.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-600">
                      {badge.description}
                    </CardContent>
                  </Card>
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

export default PlayerProfile;
