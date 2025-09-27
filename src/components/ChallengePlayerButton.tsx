import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Swords, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChallengePlayerButtonProps {
  playerId: string;
  playerName: string;
  disabled?: boolean;
}

const ChallengePlayerButton: React.FC<ChallengePlayerButtonProps> = ({
  playerId,
  playerName,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeType, setChallengeType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const { user, isAuthenticated } = useAuth();

  const handleChallenge = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para desafiar um jogador');
      return;
    }

    if (!challengeType || !preferredDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      // Create challenge record
      const { error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: user.id,
          challenged_id: playerId,
          challenge_type: challengeType,
          preferred_date: preferredDate,
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_user_activity', {
        activity_type_param: 'challenge_sent',
        activity_data_param: {
          challenged_player_id: playerId,
          challenge_type: challengeType
        }
      });

      toast.success(`Desafio enviado para ${playerName}!`);
      setIsOpen(false);
      setChallengeType('');
      setPreferredDate('');
      setMessage('');

    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Erro ao enviar desafio. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} size="sm">
          <Swords className="h-4 w-4 mr-2" />
          Desafiar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Desafiar {playerName}
          </DialogTitle>
          <DialogDescription>
            Envie um desafio para {playerName} e marquem uma partida!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenge-type">Tipo de Desafio *</Label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger id="challenge-type">
                <SelectValue placeholder="Selecione o tipo de desafio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singles">Simples</SelectItem>
                <SelectItem value="doubles">Duplas</SelectItem>
                <SelectItem value="friendly">Amistoso</SelectItem>
                <SelectItem value="ranking">Pela Pontuação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-date">Data Preferencial *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="preferred-date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem personalizada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleChallenge}
              disabled={isLoading || !challengeType || !preferredDate}
              className="flex-1"
            >
              <Swords className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Desafio'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengePlayerButton;