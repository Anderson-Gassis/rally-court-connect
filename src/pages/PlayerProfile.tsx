import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Trophy, Clock, Target, Camera, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface PlayerProfile {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  skill_level?: string;
  location?: string;
  phone?: string;
  playing_time?: string;
  dominant_hand?: string;
  preferred_surface?: string;
  bio?: string;
  date_of_birth?: string;
  favorite_courts?: string[];
}

interface MatchHistory {
  id: string;
  opponent_name: string;
  match_date: string;
  result: string;
  score?: string;
  sport_type: string;
  court_name?: string;
  duration_minutes?: number;
}

const PlayerProfile = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Partial<PlayerProfile>>({});

  const isOwnProfile = !id || id === user?.id;

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlayerProfile();
      if (isOwnProfile) {
        fetchMatchHistory();
      }
    }
  }, [id, isAuthenticated]);

  const fetchPlayerProfile = async () => {
    try {
      const targetUserId = id || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('match_history')
        .select('*')
        .eq('player_id', user?.id)
        .order('match_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMatchHistory(data || []);
    } catch (error) {
      console.error('Error fetching match history:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      setIsEditing(false); // Otimisticamente sair do modo edição
      
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        setIsEditing(true); // Voltar ao modo edição em caso de erro
        
        if (error.code === 'PGRST301') {
          toast.error('Você não tem permissão para atualizar este perfil');
        } else if (error.code === 'PGRST116') {
          toast.error('Perfil não encontrado');
        } else {
          toast.error(`Erro ao atualizar perfil: ${error.message}`);
        }
        return;
      }

      // Atualizar estado local apenas se a operação foi bem-sucedida
      setProfile(prev => ({ ...prev, ...editData } as PlayerProfile));
      toast.success('Perfil atualizado com sucesso!');
      
      // Buscar perfil atualizado para garantir sincronização
      setTimeout(() => {
        fetchPlayerProfile();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsEditing(true); // Voltar ao modo edição
      toast.error('Erro inesperado ao atualizar perfil');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user?.id);

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl } as PlayerProfile));
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>Faça login para ver perfis de jogadores</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>Fazer Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div>Carregando perfil...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Perfil não encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>Voltar</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <div className="absolute bottom-0 right-0">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90">
                          <Camera className="h-4 w-4" />
                        </div>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </Label>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    {isOwnProfile && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {isEditing ? 'Cancelar' : 'Editar Perfil'}
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skill_level && (
                      <Badge variant="secondary">{profile.skill_level}</Badge>
                    )}
                    {profile.dominant_hand && (
                      <Badge variant="outline">{profile.dominant_hand}</Badge>
                    )}
                    {profile.preferred_surface && (
                      <Badge variant="outline">Piso: {profile.preferred_surface}</Badge>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.playing_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Joga há {profile.playing_time}
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-sm">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isOwnProfile && (
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Nome Completo</Label>
                            <Input
                              id="full_name"
                              value={editData.full_name || ''}
                              onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              value={editData.phone || ''}
                              onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Cidade</Label>
                            <Input
                              id="location"
                              value={editData.location || ''}
                              onChange={(e) => setEditData({...editData, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="skill_level">Nível de Habilidade</Label>
                            <Select value={editData.skill_level || ''} onValueChange={(value) => setEditData({...editData, skill_level: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Profissional">Profissional</SelectItem>
                                <SelectItem value="Amador">Amador</SelectItem>
                                <SelectItem value="A">Categoria A</SelectItem>
                                <SelectItem value="B">Categoria B</SelectItem>
                                <SelectItem value="C">Categoria C</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="playing_time">Há quanto tempo joga?</Label>
                            <Input
                              id="playing_time"
                              placeholder="Ex: 2 anos"
                              value={editData.playing_time || ''}
                              onChange={(e) => setEditData({...editData, playing_time: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dominant_hand">Mão Dominante</Label>
                            <Select value={editData.dominant_hand || ''} onValueChange={(value) => setEditData({...editData, dominant_hand: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="destro">Destro</SelectItem>
                                <SelectItem value="canhoto">Canhoto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="preferred_surface">Piso Preferido</Label>
                          <Input
                            id="preferred_surface"
                            placeholder="Ex: Saibro, Rápida, Areia"
                            value={editData.preferred_surface || ''}
                            onChange={(e) => setEditData({...editData, preferred_surface: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label htmlFor="bio">Biografia</Label>
                          <Textarea
                            id="bio"
                            rows={4}
                            placeholder="Conte um pouco sobre você e seu estilo de jogo..."
                            value={editData.bio || ''}
                            onChange={(e) => setEditData({...editData, bio: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>
                            Salvar Alterações
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Telefone:</strong> {profile.phone || 'Não informado'}</p>
                            <p><strong>Cidade:</strong> {profile.location || 'Não informado'}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Informações de Jogo</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nível:</strong> {profile.skill_level || 'Não informado'}</p>
                            <p><strong>Tempo de jogo:</strong> {profile.playing_time || 'Não informado'}</p>
                            <p><strong>Mão dominante:</strong> {profile.dominant_hand || 'Não informado'}</p>
                            <p><strong>Piso preferido:</strong> {profile.preferred_surface || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Partidas</CardTitle>
                    <CardDescription>
                      Suas últimas 10 partidas registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchHistory.length > 0 ? (
                      <div className="space-y-4">
                        {matchHistory.map((match) => (
                          <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{match.opponent_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(match.match_date).toLocaleDateString('pt-BR')} • {match.sport_type}
                              </p>
                              {match.court_name && (
                                <p className="text-sm text-muted-foreground">{match.court_name}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant={match.result === 'vitoria' ? 'default' : 'destructive'}>
                                {match.result === 'vitoria' ? 'Vitória' : 'Derrota'}
                              </Badge>
                              {match.score && (
                                <p className="text-sm mt-1">{match.score}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhuma partida registrada ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Total de Partidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{matchHistory.length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Vitórias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {matchHistory.filter(m => m.result === 'vitoria').length}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Taxa de Vitória</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {matchHistory.length > 0 
                            ? Math.round((matchHistory.filter(m => m.result === 'vitoria').length / matchHistory.length) * 100)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlayerProfile;