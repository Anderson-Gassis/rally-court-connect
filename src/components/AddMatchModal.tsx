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

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchAdded?: () => void;
}

const AddMatchModal: React.FC<AddMatchModalProps> = ({ isOpen, onClose, onMatchAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validações básicas
    if (!formData.opponent_name.trim()) {
      toast.error('Nome do oponente é obrigatório');
      return;
    }
    if (!formData.match_date) {
      toast.error('Data da partida é obrigatória');
      return;
    }
    if (!formData.result) {
      toast.error('Resultado da partida é obrigatório');
      return;
    }
    if (!formData.sport_type) {
      toast.error('Modalidade é obrigatória');
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

      await matchHistoryService.addMatch(matchData);
      
      toast.success('Partida adicionada com sucesso!');
      
      // Reset form
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Partida</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opponent_name">Nome do Oponente *</Label>
              <Input
                id="opponent_name"
                value={formData.opponent_name}
                onChange={(e) => setFormData({...formData, opponent_name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="match_date">Data da Partida *</Label>
              <Input
                id="match_date"
                type="date"
                value={formData.match_date}
                onChange={(e) => setFormData({...formData, match_date: e.target.value})}
                required
              />
            </div>
          </div>

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
              <Label htmlFor="sport_type">Modalidade *</Label>
              <Select value={formData.sport_type} onValueChange={(value) => setFormData({...formData, sport_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tennis">Tênis</SelectItem>
                  <SelectItem value="padel">Padel</SelectItem>
                  <SelectItem value="beach-tennis">Beach Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Placar</Label>
              <Input
                id="score"
                placeholder="Ex: 6-4, 6-2"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="90"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court_name">Local/Quadra</Label>
            <Input
              id="court_name"
              placeholder="Nome da quadra ou local"
              value={formData.court_name}
              onChange={(e) => setFormData({...formData, court_name: e.target.value})}
            />
          </div>

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

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Partida'}
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