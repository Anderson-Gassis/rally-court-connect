import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { matchHistoryService, MatchHistory } from '@/services/matchHistoryService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchAdded?: () => void;
}

const AddMatchModal: React.FC<AddMatchModalProps> = ({ isOpen, onClose, onMatchAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [acceptedChallenges, setAcceptedChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [formData, setFormData] = useState({
    opponent_name: '',
    match_date: '',
    result: '' as 'vitória' | 'derrota' | '',
    score: '',
    sport_type: '',
    court_name: '',
    duration_minutes: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchAcceptedChallenges();
    }
  }, [isOpen, user]);

  const fetchAcceptedChallenges = async () => {
    if (!user) return;

    try {
      // Buscar desafios aceitos
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'accepted')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .gte('preferred_date', new Date().toISOString().split('T')[0]);

      if (challengesError) throw challengesError;

      if (!challengesData || challengesData.length === 0) {
        setAcceptedChallenges([]);
        return;
      }

      // Buscar perfis dos oponentes
      const opponentIds = challengesData.map(c => 
        c.challenger_id === user.id ? c.challenged_id : c.challenger_id
      );

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', opponentIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);

      const formattedChallenges = challengesData.map(challenge => {
        const isChallenger = challenge.challenger_id === user.id;
        const opponentId = isChallenger ? challenge.challenged_id : challenge.challenger_id;
        
        return {
          id: challenge.id,
          opponent_name: profilesMap.get(opponentId) || 'Oponente',
          opponent_id: opponentId,
          preferred_date: challenge.preferred_date,
          challenge_type: challenge.challenge_type
        };
      });

      setAcceptedChallenges(formattedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setAcceptedChallenges([]);
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    const selectedChallenge = acceptedChallenges.find(c => c.id === challengeId);
    if (selectedChallenge) {
      setFormData(prev => ({
        ...prev,
        opponent_name: selectedChallenge.opponent_name,
        match_date: selectedChallenge.preferred_date,
        sport_type: selectedChallenge.challenge_type
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validar se há um desafio selecionado
    if (!selectedChallengeId) {
      toast.error('Selecione um convite aceito para registrar a partida');
      return;
    }

    // Validações básicas
    if (!formData.result) {
      toast.error('Resultado da partida é obrigatório');
      return;
    }
    if (!formData.score.trim()) {
      toast.error('Placar é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const matchData: Omit<MatchHistory, 'id' | 'created_at' | 'updated_at'> = {
        player_id: user.id,
        opponent_name: formData.opponent_name.trim(),
        match_date: formData.match_date,
        result: formData.result as 'vitória' | 'derrota',
        score: formData.score.trim() || null,
        sport_type: formData.sport_type,
        court_name: formData.court_name.trim() || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        notes: formData.notes.trim() || null,
      };

      const selectedChallenge = acceptedChallenges.find(c => c.id === selectedChallengeId);
      if (selectedChallenge) {
        matchData.opponent_id = selectedChallenge.opponent_id;
      }

      await matchHistoryService.addMatch(matchData);

      // Atualizar status do desafio para 'completed'
      await supabase
        .from('challenges')
        .update({ status: 'completed' })
        .eq('id', selectedChallengeId);
      
      toast.success('Partida registrada com sucesso!');
      
      // Reset form
      setSelectedChallengeId('');
      setFormData({
        opponent_name: '',
        match_date: '',
        result: '' as 'vitória' | 'derrota' | '',
        score: '',
        sport_type: '',
        court_name: '',
        duration_minutes: '',
        notes: '',
      });
      
      onClose();
      if (onMatchAdded) onMatchAdded();
    } catch (error: any) {
      console.error('Error adding match:', error);
      const errorMessage = error?.message || 'Erro ao adicionar partida';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Resultado da Partida</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {acceptedChallenges.length > 0 ? (
            <>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Importante:</strong> Você só pode registrar resultados de convites aceitos.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenge">Selecione o Convite *</Label>
                <Select value={selectedChallengeId} onValueChange={handleChallengeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um convite aceito" />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedChallenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        vs {challenge.opponent_name} - {new Date(challenge.preferred_date).toLocaleDateString('pt-BR')} - {challenge.challenge_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedChallengeId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Oponente</Label>
                      <Input value={formData.opponent_name} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input type="date" value={formData.match_date} disabled />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Input value={formData.sport_type} disabled />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-sm text-amber-900 mb-2">
                <strong>Nenhum convite aceito disponível</strong>
              </p>
              <p className="text-xs text-amber-800">
                Você precisa aceitar um convite para registrar uma partida. Vá para a aba "Próximos Jogos" para aceitar convites.
              </p>
            </div>
          )}

          {selectedChallengeId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="result">Resultado *</Label>
                  <Select value={formData.result} onValueChange={(value: 'vitória' | 'derrota') => setFormData({...formData, result: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vitória">Vitória</SelectItem>
                      <SelectItem value="derrota">Derrota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="score">Placar *</Label>
                  <Input
                    id="score"
                    placeholder="Ex: 6-4, 6-2"
                    value={formData.score}
                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duração (min)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    placeholder="90"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="court_name">Local/Quadra</Label>
                  <Input
                    id="court_name"
                    placeholder="Nome da quadra"
                    value={formData.court_name}
                    onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          {selectedChallengeId && (
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Comentários sobre a partida..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading || !selectedChallengeId || acceptedChallenges.length === 0} 
              className="flex-1 bg-tennis-blue hover:bg-tennis-blue-dark"
            >
              {loading ? 'Salvando...' : 'Registrar Resultado'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;