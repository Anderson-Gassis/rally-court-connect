import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trophy, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TournamentMatchManagerProps {
  tournamentId: string;
  matches: any[];
  onMatchUpdated: () => void;
  isOrganizer: boolean;
}

export const TournamentMatchManager = ({ 
  tournamentId, 
  matches, 
  onMatchUpdated,
  isOrganizer 
}: TournamentMatchManagerProps) => {
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [winnerId, setWinnerId] = useState<string>('');
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [loading, setLoading] = useState(false);

  const pendingMatches = matches.filter((m: any) => m.status === 'pending' || m.status === 'in_progress');
  const selectedMatchData = matches.find((m: any) => m.id === selectedMatch);

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMatch || !winnerId || !player1Score || !player2Score) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_brackets')
        .update({
          winner_id: winnerId,
          player1_score: player1Score,
          player2_score: player2Score,
          status: 'completed'
        })
        .eq('id', selectedMatch);

      if (error) throw error;

      // Check if round is complete and generate next round
      await checkAndGenerateNextRound();

      toast.success('Resultado registrado com sucesso!');
      setSelectedMatch('');
      setWinnerId('');
      setPlayer1Score('');
      setPlayer2Score('');
      onMatchUpdated();
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error('Erro ao registrar resultado');
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerateNextRound = async () => {
    try {
      // Get current match round
      const currentMatch = matches.find(m => m.id === selectedMatch);
      if (!currentMatch) return;

      const currentRound = currentMatch.round;

      // Check if all matches in current round are completed
      const roundMatches = matches.filter(m => m.round === currentRound);
      const allCompleted = roundMatches.every(m => 
        m.id === selectedMatch || m.status === 'completed'
      );

      if (!allCompleted) return;

      // Get winners from current round
      const winners = await supabase
        .from('tournament_brackets')
        .select('winner_id')
        .eq('tournament_id', tournamentId)
        .eq('round', currentRound)
        .eq('status', 'completed')
        .not('winner_id', 'is', null);

      if (winners.error || !winners.data || winners.data.length < 2) return;

      // Determine next round name
      const roundNumber = parseInt(currentRound.split('_')[1]);
      const nextRound = `round_${roundNumber + 1}`;

      // Generate next round matches
      const nextMatches = [];
      for (let i = 0; i < winners.data.length / 2; i++) {
        nextMatches.push({
          tournament_id: tournamentId,
          round: nextRound,
          match_number: i + 1,
          player1_id: winners.data[i * 2]?.winner_id,
          player2_id: winners.data[i * 2 + 1]?.winner_id,
          status: 'pending'
        });
      }

      // Insert next round matches
      if (nextMatches.length > 0) {
        const { error: insertError } = await supabase
          .from('tournament_brackets')
          .insert(nextMatches);

        if (insertError) throw insertError;

        toast.success(`Próxima rodada (${nextRound}) gerada automaticamente!`);
      }
    } catch (error) {
      console.error('Error generating next round:', error);
      // Don't throw - this is a nice-to-have feature
    }
  };

  const handleDisqualifyPlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Tem certeza que deseja desqualificar ${playerName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    try {
      // Remove player from tournament registrations
      const { error: regError } = await supabase
        .from('tournament_registrations')
        .update({ validated: false, validation_notes: 'Desqualificado' })
        .eq('tournament_id', tournamentId)
        .eq('user_id', playerId);

      if (regError) throw regError;

      // Update all pending matches where this player is involved
      const { error: matchError } = await supabase
        .from('tournament_brackets')
        .update({ status: 'cancelled' })
        .eq('tournament_id', tournamentId)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('status', 'pending');

      if (matchError) throw matchError;

      toast.success(`${playerName} foi desqualificado do torneio`);
      onMatchUpdated();
    } catch (error) {
      console.error('Error disqualifying player:', error);
      toast.error('Erro ao desqualificar jogador');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Apenas o organizador do torneio pode gerenciar resultados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Gerenciar Resultados das Partidas
        </CardTitle>
        <CardDescription>
          Insira resultados manualmente e gerencie desqualificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitResult} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="match">Selecionar Partida *</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma partida pendente" />
              </SelectTrigger>
              <SelectContent>
                {pendingMatches.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma partida pendente
                  </div>
                ) : (
                  pendingMatches.map((match: any) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.round} - Partida #{match.match_number}: {match.player1?.full_name || 'TBD'} vs {match.player2?.full_name || 'TBD'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedMatchData && (
            <>
              <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium mb-2">Jogador 1</p>
                  <p className="font-semibold">{selectedMatchData.player1?.full_name || 'TBD'}</p>
                  {selectedMatchData.player1_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDisqualifyPlayer(
                        selectedMatchData.player1_id, 
                        selectedMatchData.player1?.full_name || 'Jogador 1'
                      )}
                      disabled={loading}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Desqualificar
                    </Button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Jogador 2</p>
                  <p className="font-semibold">{selectedMatchData.player2?.full_name || 'TBD'}</p>
                  {selectedMatchData.player2_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDisqualifyPlayer(
                        selectedMatchData.player2_id, 
                        selectedMatchData.player2?.full_name || 'Jogador 2'
                      )}
                      disabled={loading}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Desqualificar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winner">Vencedor *</Label>
                <Select value={winnerId} onValueChange={setWinnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vencedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMatchData.player1_id && (
                      <SelectItem value={selectedMatchData.player1_id}>
                        {selectedMatchData.player1?.full_name}
                      </SelectItem>
                    )}
                    {selectedMatchData.player2_id && (
                      <SelectItem value={selectedMatchData.player2_id}>
                        {selectedMatchData.player2?.full_name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="player1Score">Placar Jogador 1 *</Label>
                  <Input
                    id="player1Score"
                    placeholder="Ex: 6-4, 6-3"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player2Score">Placar Jogador 2 *</Label>
                  <Input
                    id="player2Score"
                    placeholder="Ex: 4-6, 3-6"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(e.target.value)}
                    maxLength={50}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Registrar Resultado'}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
