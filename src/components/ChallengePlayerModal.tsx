import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MessageSquare, Trophy } from 'lucide-react';
import { challengesService } from '@/services/challengesService';
import { toast } from 'sonner';

interface ChallengePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
}

const ChallengePlayerModal = ({ isOpen, onClose, playerId, playerName }: ChallengePlayerModalProps) => {
  const [challengeType, setChallengeType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeType || !preferredDate || !preferredTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await challengesService.createChallenge({
        challenged_id: playerId,
        challenge_type: challengeType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        message: message || `Olá ${playerName}! Gostaria de jogar uma partida com você.`
      });

      toast.success(`Convite enviado para ${playerName}!`);
      onClose();
      
      // Reset form
      setChallengeType('');
      setPreferredDate('');
      setPreferredTime('');
      setMessage('');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Erro ao enviar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-blue" />
            Convidar para Jogar
          </DialogTitle>
          <DialogDescription>
            Envie um convite para {playerName} para uma partida
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challengeType">Tipo de Partida *</Label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o tipo de partida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">🎾 Amistoso</SelectItem>
                <SelectItem value="singles">👤 Individual (Singles)</SelectItem>
                <SelectItem value="doubles">👥 Duplas (Doubles)</SelectItem>
                <SelectItem value="ranking">🏆 Partida Rankeada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredDate">Data Preferida *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredTime">Horário *</Label>
            <Input
              id="preferredTime"
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="message"
                placeholder={`Olá ${playerName}! Gostaria de jogar uma partida com você...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pl-10 min-h-[80px]"
                maxLength={500}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-tennis-blue hover:bg-tennis-blue-dark"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengePlayerModal;