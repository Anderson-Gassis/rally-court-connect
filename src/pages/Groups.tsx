import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Users, Plus, Search, Lock, Globe, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { groupsService, Group } from '@/services/groupsService';

const SPORT_TYPES = [
  { value: 'tennis', label: 'Tênis' },
  { value: 'beach_tennis', label: 'Beach Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'squash', label: 'Squash' },
  { value: 'badminton', label: 'Badminton' },
  { value: 'outros', label: 'Outros' },
];

const Groups = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_type: 'tennis',
    is_private: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchGroups();
  }, [isAuthenticated]);

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allGroups, userGroups] = await Promise.all([
        groupsService.getGroups(),
        groupsService.getMyGroups(user.id),
      ]);
      setGroups(allGroups);
      setMyGroups(userGroups);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!formData.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      await groupsService.createGroup({ ...formData, owner_id: user.id });
      toast.success('Grupo criado com sucesso! 🎉');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', sport_type: 'tennis', is_private: false });
      await fetchGroups();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar grupo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (group: Group) => {
    if (!user) return;
    try {
      await groupsService.joinGroup(group.id, user.id);
      toast.success(`Você entrou em "${group.name}"! 🙌`);
      await fetchGroups();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar no grupo');
    }
  };

  const handleLeave = async (group: Group) => {
    if (!user) return;
    try {
      await groupsService.leaveGroup(group.id, user.id);
      toast.success(`Você saiu de "${group.name}"`);
      await fetchGroups();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sair do grupo');
    }
  };

  const isMemberOf = (groupId: string) =>
    myGroups.some(g => g.id === groupId);

  const filtered = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || g.sport_type === sportFilter;
    return matchesSearch && matchesSport;
  });

  const getSportLabel = (type: string) =>
    SPORT_TYPES.find(s => s.value === type)?.label ?? type;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Grupos</h1>
              <p className="text-sm text-muted-foreground">
                Encontre e participe de grupos esportivos
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Grupo
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* My Groups */}
        {myGroups.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Meus Grupos ({myGroups.length})
            </h2>
            <div className="flex gap-2 flex-wrap">
              {myGroups.map(g => (
                <Badge
                  key={g.id}
                  variant="secondary"
                  className="text-sm py-1 px-3 cursor-pointer hover:bg-secondary/70"
                >
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos os esportes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os esportes</SelectItem>
              {SPORT_TYPES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                Criar o primeiro grupo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(group => {
              const member = isMemberOf(group.id);
              return (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={group.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base line-clamp-1">
                            {group.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {getSportLabel(group.sport_type)}
                            </Badge>
                            {group.is_private ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" /> Privado
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" /> Público
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {member ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleLeave(group)}
                          disabled={group.owner_id === user?.id}
                          title={group.owner_id === user?.id ? 'Você é o dono' : 'Sair do grupo'}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="shrink-0 gap-1"
                          onClick={() => handleJoin(group)}
                        >
                          <LogIn className="h-4 w-4" />
                          Entrar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {group.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Crie um grupo para reunir jogadores do mesmo esporte.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Nome do Grupo *</Label>
              <Input
                id="group-name"
                placeholder="Ex: Beach Tennis Zona Sul"
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="group-desc">Descrição</Label>
              <Textarea
                id="group-desc"
                placeholder="Descreva o grupo, nível dos jogadores, frequência de jogos..."
                rows={3}
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                className="mt-1.5 resize-none"
              />
            </div>

            <div>
              <Label>Esporte *</Label>
              <Select
                value={formData.sport_type}
                onValueChange={v => setFormData(f => ({ ...f, sport_type: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Grupo Privado</p>
                <p className="text-xs text-muted-foreground">
                  Apenas convidados podem ver e entrar
                </p>
              </div>
              <Switch
                checked={formData.is_private}
                onCheckedChange={v => setFormData(f => ({ ...f, is_private: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
