import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Trophy, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import * as leaguesService from '@/services/leaguesService';
import { Link } from 'react-router-dom';

export function LeaguesManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_type: '',
    rules: '',
    is_private: true
  });

  const queryClient = useQueryClient();

  const { data: myLeagues = [] } = useQuery({
    queryKey: ['my-leagues'],
    queryFn: leaguesService.getMyLeagues
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['league-invitations'],
    queryFn: leaguesService.getLeagueInvitations
  });

  const createLeagueMutation = useMutation({
    mutationFn: leaguesService.createLeague,
    onSuccess: () => {
      toast.success('Liga criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-leagues'] });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        description: '',
        sport_type: '',
        rules: '',
        is_private: true
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar liga');
    }
  });

  const respondInvitationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) =>
      leaguesService.respondToLeagueInvitation(id, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'accepted'
          ? 'Convite aceito!'
          : 'Convite recusado'
      );
      queryClient.invalidateQueries({ queryKey: ['league-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['my-leagues'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeagueMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Minhas Ligas</h2>
          <p className="text-muted-foreground">
            Crie e gerencie suas ligas esportivas locais
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Liga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Liga</DialogTitle>
              <DialogDescription>
                Crie uma liga para organizar torneios e manter rankings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Liga *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sport_type">Esporte *</Label>
                <Select
                  value={formData.sport_type}
                  onValueChange={(value) => setFormData({ ...formData, sport_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o esporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tennis">Tênis</SelectItem>
                    <SelectItem value="Paddle">Paddle</SelectItem>
                    <SelectItem value="Volleyball">Vôlei</SelectItem>
                    <SelectItem value="Basketball">Basquete</SelectItem>
                    <SelectItem value="Soccer">Futebol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua liga..."
                />
              </div>

              <div>
                <Label htmlFor="rules">Regras</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="Regras da liga..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={createLeagueMutation.isPending}>
                {createLeagueMutation.isPending ? 'Criando...' : 'Criar Liga'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation: any) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.league?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Convidado por {invitation.inviter?.full_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondInvitationMutation.mutate({ id: invitation.id, status: 'accepted' })}
                    >
                      Aceitar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => respondInvitationMutation.mutate({ id: invitation.id, status: 'rejected' })}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {myLeagues.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Você ainda não faz parte de nenhuma liga.</p>
            <p className="text-sm mt-1">Crie sua primeira liga para começar!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myLeagues.map((member: any) => (
            <Link key={member.id} to={`/leagues/${member.league.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{member.league.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {member.league.sport_type}
                      </CardDescription>
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? 'Administrador' : 'Membro'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {member.league.description || 'Sem descrição'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>Torneios</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}