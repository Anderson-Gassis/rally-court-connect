import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Search, Trophy, Users, Target, Clock, Zap } from 'lucide-react';
import { Player, playersService } from '@/services/playersService';
import ChallengePlayerModal from '@/components/ChallengePlayerModal';
import SafeLoading from '@/components/SafeLoading';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const PlayersSearchContainer = () => {
  const [distance, setDistance] = useState([10]);
  const [sportType, setSportType] = useState('all');
  const [skillLevel, setSkillLevel] = useState('all');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const searchPlayers = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para buscar jogadores');
      return;
    }

    console.log('Starting player search...', { distance: distance[0], sportType, skillLevel });
    setLoading(true);
    setError(null);

    try {
      const filters = {
        distance: distance[0],
        ...(sportType && sportType !== 'all' && { sport_type: sportType }),
        ...(skillLevel && skillLevel !== 'all' && { skill_level: skillLevel })
      };

      console.log('Calling playersService with filters:', filters);
      const results = await playersService.getNearbyPlayers(filters);
      console.log('Players search results:', results);
      setPlayers(results);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Erro ao buscar jogadores. Tente novamente.');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [distance, sportType, skillLevel, isAuthenticated]);

  const handleChallengePlayer = useCallback((player: Player) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para desafiar jogadores');
      return;
    }
    setSelectedPlayer(player);
    setIsChallengeModalOpen(true);
  }, [isAuthenticated]);

  const getSkillLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Auto search on mount if authenticated - run only once
  useEffect(() => {
    let isMounted = true;
    
    const initialSearch = async () => {
      if (isAuthenticated && isMounted) {
        await searchPlayers();
      }
    };
    
    initialSearch();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only run when auth status changes

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto text-center">
        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Encontre Jogadores Próximos</h2>
        <p className="text-gray-600 mb-4">
          Faça login para descobrir jogadores próximos e desafiar para uma partida!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jogadores Próximos</h2>
          <p className="text-gray-600">
            Encontre jogadores na sua região e desafie para uma partida
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Select value={sportType} onValueChange={setSportType}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                <SelectItem value="tennis">🎾 Tênis</SelectItem>
                <SelectItem value="padel">🏸 Padel</SelectItem>
                <SelectItem value="beach-tennis">🏐 Beach Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={searchPlayers}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {/* Distance Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Distância máxima
            </label>
            <span className="text-sm text-blue-600 font-medium">
              {distance[0]} km
            </span>
          </div>
          <Slider
            value={distance}
            onValueChange={setDistance}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Erro ao carregar jogadores
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={searchPlayers}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : loading ? (
            <SafeLoading message="Buscando jogadores..." />
          ) : players.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {players.length} jogador{players.length !== 1 ? 'es' : ''} encontrado{players.length !== 1 ? 's' : ''}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {players.map((player) => (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
                              {getPlayerInitials(player.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {player.full_name}
                            </h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {player.location || 'Localização não informada'}
                              {player.distance && (
                                <span className="ml-2 text-blue-600 font-medium">
                                  • {player.distance.toFixed(1)}km
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={getSkillLevelColor(player.skill_level)}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {player.skill_level || 'Nível não informado'}
                          </Badge>
                          
                          {player.preferred_surface && (
                            <Badge variant="outline">
                              {player.preferred_surface}
                            </Badge>
                          )}
                        </div>

                        {player.bio && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {player.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {player.playing_time || 'Horário flexível'}
                          </div>
                          {player.dominant_hand && (
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-1" />
                              {player.dominant_hand}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleChallengePlayer(player)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Convidar para Jogar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum jogador encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar os filtros ou aumentar a distância de busca.
              </p>
              <Button 
                onClick={searchPlayers}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>

      <ChallengePlayerModal
        isOpen={isChallengeModalOpen}
        onClose={() => {
          setIsChallengeModalOpen(false);
          setSelectedPlayer(null);
        }}
        playerId={selectedPlayer?.user_id || ''}
        playerName={selectedPlayer?.full_name || ''}
      />
    </>
  );
};

export default PlayersSearchContainer;