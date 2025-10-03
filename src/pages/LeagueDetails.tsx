import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Plus, Calendar, Medal } from 'lucide-react';
import { toast } from 'sonner';
import * as leaguesService from '@/services/leaguesService';
import * as friendsService from '@/services/friendsService';
import { useAuth } from '@/hooks/useAuth';

export default function LeagueDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [tournamentData, setTournamentData] = useState({
    name: '',
    description: '',
    tournament_type: 'knockout' as 'knockout' | 'round_robin' | 'league',
    start_date: '',
    end_date: ''
  });

  const { data: league } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leaguesService.getLeagueDetails(id!)
  });

  const { data: members = [] } = useQuery({
    queryKey: ['league-members', id],
    queryFn: () => leaguesService.getLeagueMembers(id!)
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['league-tournaments', id],
    queryFn: () => leaguesService.getLeagueTournaments(id!)
  });

  const { data: ranking = [] } = useQuery({
    queryKey: ['league-ranking', id],
    queryFn: () => leaguesService.getLeagueRanking(id!)
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsService.getFriendsList
  });

  const inviteMutation = useMutation({
    mutationFn: (friendId: string) => leaguesService.inviteToLeague(id!, friendId),
    onSuccess: () => {
      toast.success('Convite enviado!');
      setIsInviteOpen(false);
      setSelectedFriend('');
    }
  });

  const createTournamentMutation = useMutation({
    mutationFn: leaguesService.createLeagueTournament,
    onSuccess: () => {
      toast.success('Torneio criado!');
      queryClient.invalidateQueries({ queryKey: ['league-tournaments', id] });
      setIsTournamentOpen(false);
      setTournamentData({
        name: '',
        description: '',
        tournament_type: 'knockout',
        start_date: '',
        end_date: ''
      });
    }
  });

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    createTournamentMutation.mutate({
      league_id: id!,
      ...tournamentData
    });
  };

  const isAdmin = league?.admin_id === user?.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/player/dashboard?tab=leagues">
            <Button variant="ghost">← Voltar para Ligas</Button>
          </Link>
        </div>

        {league && (
          <>
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold">{league.name}</h1>
                  <p className="text-muted-foreground mt-2">{league.sport_type}</p>
                  {league.description && (
                    <p className="mt-4">{league.description}</p>
                  )}
                  {league.rules && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Regras:</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {league.rules}
                      </p>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Badge>Administrador</Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="members" className="w-full">
              <TabsList>
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Membros ({members.length})
                </TabsTrigger>
                <TabsTrigger value="tournaments">
                  <Trophy className="h-4 w-4 mr-2" />
                  Torneios ({tournaments.length})
                </TabsTrigger>
                <TabsTrigger value="ranking">
                  <Medal className="h-4 w-4 mr-2" />
                  Ranking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4 mt-6">
                {isAdmin && (
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Convidar Membro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convidar Amigo</DialogTitle>
                        <DialogDescription>
                          Convide um dos seus amigos para participar da liga
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Selecione um amigo</Label>
                          <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um amigo" />
                            </SelectTrigger>
                            <SelectContent>
                              {friends.map((f: any) => (
                                <SelectItem key={f.friend_id} value={f.friend_id}>
                                  {f.friend?.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => inviteMutation.mutate(selectedFriend)}
                          disabled={!selectedFriend || inviteMutation.isPending}
                          className="w-full"
                        >
                          Enviar Convite
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="grid gap-4">
                  {members.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={member.user?.avatar_url} />
                              <AvatarFallback>
                                {member.user?.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Membro desde {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? 'Admin' : 'Membro'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tournaments" className="space-y-4 mt-6">
                {isAdmin && (
                  <Dialog open={isTournamentOpen} onOpenChange={setIsTournamentOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Torneio
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Novo Torneio</DialogTitle>
                        <DialogDescription>
                          Configure um torneio para sua liga
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTournament} className="space-y-4">
                        <div>
                          <Label htmlFor="t-name">Nome do Torneio *</Label>
                          <Input
                            id="t-name"
                            value={tournamentData.name}
                            onChange={(e) => setTournamentData({ ...tournamentData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="t-type">Tipo *</Label>
                          <Select
                            value={tournamentData.tournament_type}
                            onValueChange={(value: any) =>
                              setTournamentData({ ...tournamentData, tournament_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="knockout">Mata-Mata</SelectItem>
                              <SelectItem value="round_robin">Todos contra Todos</SelectItem>
                              <SelectItem value="league">Pontos Corridos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="t-desc">Descrição</Label>
                          <Textarea
                            id="t-desc"
                            value={tournamentData.description}
                            onChange={(e) => setTournamentData({ ...tournamentData, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="t-start">Data Início *</Label>
                            <Input
                              id="t-start"
                              type="date"
                              value={tournamentData.start_date}
                              onChange={(e) => setTournamentData({ ...tournamentData, start_date: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="t-end">Data Fim *</Label>
                            <Input
                              id="t-end"
                              type="date"
                              value={tournamentData.end_date}
                              onChange={(e) => setTournamentData({ ...tournamentData, end_date: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={createTournamentMutation.isPending}>
                          Criar Torneio
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {tournaments.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Nenhum torneio criado ainda
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {tournaments.map((tournament: any) => (
                      <Card key={tournament.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{tournament.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {tournament.description}
                              </CardDescription>
                            </div>
                            <Badge>{tournament.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                                {new Date(tournament.end_date).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge variant="outline">{tournament.tournament_type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ranking" className="space-y-4 mt-6">
                {ranking.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Nenhum ranking disponível ainda
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Classificação Geral</CardTitle>
                      <CardDescription>
                        Ranking baseado nos resultados dos torneios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ranking.map((rank: any, index: number) => (
                          <div
                            key={rank.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold">
                                {index + 1}
                              </div>
                              <Avatar>
                                <AvatarImage src={rank.user?.avatar_url} />
                                <AvatarFallback>
                                  {rank.user?.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{rank.user?.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {rank.matches_played} jogos
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <p className="font-bold text-2xl">{rank.points}</p>
                                <p className="text-muted-foreground">Pontos</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-green-600">{rank.wins}V</p>
                                <p className="text-muted-foreground text-xs">Vitórias</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-yellow-600">{rank.draws}E</p>
                                <p className="text-muted-foreground text-xs">Empates</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-red-600">{rank.losses}D</p>
                                <p className="text-muted-foreground text-xs">Derrotas</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}