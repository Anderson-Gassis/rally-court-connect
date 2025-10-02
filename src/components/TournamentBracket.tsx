import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Trophy, Clock, ChevronRight } from 'lucide-react';

interface TournamentBracketProps {
  tournamentId: string;
}

const TournamentBracket = ({ tournamentId }: TournamentBracketProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  useEffect(() => {
    fetchMatches();
    
    // Subscribe to match updates
    const channel = supabase
      .channel('bracket-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_brackets',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_brackets')
        .select(`
          *,
          player1:player1_id (full_name, ranking_points),
          player2:player2_id (full_name, ranking_points),
          winner:winner_id (full_name)
        `)
        .eq('tournament_id', tournamentId)
        .order('round')
        .order('match_number');

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast.error('Erro ao carregar chaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('match_comments')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const openMatchDialog = (match: any) => {
    setSelectedMatch(match);
    setPlayer1Score(match.player1_score || '');
    setPlayer2Score(match.player2_score || '');
    fetchComments(match.id);
  };

  const advanceWinnerToNextRound = async (currentMatch: any, winnerId: string) => {
    try {
      // Determine position in next round
      const currentRound = currentMatch.round;
      const roundNumber = parseInt(String(currentRound).split('_')[1]);
      const nextRound = `round_${roundNumber + 1}`;
      const nextMatchNumber = Math.ceil(currentMatch.match_number / 2);
      
      // Determine if winner goes to player1 or player2 position
      const isPlayer1Position = currentMatch.match_number % 2 === 1;
      
      // Update next round match with the winner
      const { error } = await supabase
        .from('tournament_brackets')
        .update({
          [isPlayer1Position ? 'player1_id' : 'player2_id']: winnerId
        })
        .eq('tournament_id', tournamentId)
        .eq('round', nextRound)
        .eq('match_number', nextMatchNumber);

      if (error) throw error;

      // Check if this was the final match
      const { data: finalCheck } = await supabase
        .from('tournament_brackets')
        .select('round')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: false })
        .limit(1);

      if (finalCheck && finalCheck[0]?.round === currentRound) {
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournamentId);
        toast.success('🏆 Torneio finalizado! Campeão definido!');
      } else {
        toast.success('Vencedor avançou para a próxima rodada!');
      }
    } catch (error) {
      console.error('Error advancing winner:', error);
      toast.error('Erro ao avançar vencedor');
    }
  };

  const submitScore = async () => {
    if (!selectedMatch || !user) return;

    if (!player1Score || !player2Score) {
      toast.error('Preencha os placares de ambos os jogadores');
      return;
    }

    try {
      // Determine winner
      const winnerId = player1Score > player2Score ? selectedMatch.player1_id : selectedMatch.player2_id;

      const { error } = await supabase
        .from('tournament_brackets')
        .update({
          player1_score: player1Score,
          player2_score: player2Score,
          winner_id: winnerId,
          status: 'completed'
        })
        .eq('id', selectedMatch.id);

      if (error) throw error;

      // Advance winner to next round
      await advanceWinnerToNextRound(selectedMatch, winnerId);

      toast.success('Resultado registrado com sucesso!');
      setSelectedMatch(null);
      fetchMatches();
    } catch (error: any) {
      console.error('Error submitting score:', error);
      toast.error('Erro ao enviar resultado');
    }
  };

  const submitComment = async () => {
    if (!selectedMatch || !user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('match_comments')
        .insert({
          match_id: selectedMatch.id,
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedMatch.id);
      toast.success('Comentário adicionado!');
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const groupMatchesByRound = () => {
    const grouped: { [key: string]: any[] } = {};
    matches.forEach(match => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    return grouped;
  };

  const getRoundName = (round: string) => {
    const roundNumber = parseInt(round.split('_')[1]);
    const roundMap: { [key: number]: string } = {
      1: 'Primeira Rodada (R32/R16)',
      2: 'Segunda Rodada (R16/R8)',
      3: 'Quartas de Final',
      4: 'Semifinal',
      5: 'Final'
    };
    return roundMap[roundNumber] || `Rodada ${roundNumber}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando chaves...</p>
        </CardContent>
      </Card>
    );
  }

  const groupedMatches = groupMatchesByRound();

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedMatches).map(([round, roundMatches]) => (
          <Card key={round}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {getRoundName(round)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundMatches.map((match: any) => (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openMatchDialog(match)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Partida #{match.match_number}
                      </span>
                      <Badge variant={match.status === 'completed' ? 'default' : 'outline'}>
                        {match.status === 'completed' ? 'Finalizada' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="font-medium">
                          {match.player1?.full_name || 'TBD'}
                        </span>
                        {match.player1_score && (
                          <span className="font-bold">{match.player1_score}</span>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                      </div>

                      <div className={`flex items-center justify-between p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="font-medium">
                          {match.player2?.full_name || 'TBD'}
                        </span>
                        {match.player2_score && (
                          <span className="font-bold">{match.player2_score}</span>
                        )}
                      </div>
                    </div>

                    {match.scheduled_time && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(match.scheduled_time).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Partida</DialogTitle>
            <DialogDescription>
              Partida #{selectedMatch?.match_number} - {getRoundName(selectedMatch?.round)}
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-6">
              {/* Score Input */}
              {selectedMatch.status === 'pending' && user && 
               (user.id === selectedMatch.player1_id || user.id === selectedMatch.player2_id) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reportar Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {selectedMatch.player1?.full_name}
                        </label>
                        <Input
                          type="text"
                          placeholder="6-4, 6-3"
                          value={player1Score}
                          onChange={(e) => setPlayer1Score(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {selectedMatch.player2?.full_name}
                        </label>
                        <Input
                          type="text"
                          placeholder="4-6, 3-6"
                          value={player2Score}
                          onChange={(e) => setPlayer2Score(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={submitScore} className="w-full">
                      Enviar Resultado
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Result Display */}
              {selectedMatch.status === 'completed' && (
                <Card className="bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-lg">
                        Vencedor: {selectedMatch.winner?.full_name}
                      </p>
                      <div className="mt-4 space-y-2">
                        <p>{selectedMatch.player1?.full_name}: {selectedMatch.player1_score}</p>
                        <p>{selectedMatch.player2?.full_name}: {selectedMatch.player2_score}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comentários da Partida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={submitComment} size="sm">
                        Comentar
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        Nenhum comentário ainda. Seja o primeiro!
                      </p>
                    ) : (
                      comments.map((comment: any) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">
                              {comment.profiles?.full_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TournamentBracket;