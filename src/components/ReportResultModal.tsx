import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy, Target } from 'lucide-react';
import { toast } from 'sonner';

interface ReportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  opponentName: string;
  onSubmit: (result: {
    challengeId: string;
    result: 'win' | 'loss';
    score: string;
    notes?: string;
  }) => Promise<void>;
}

export const ReportResultModal = ({ 
  isOpen, 
  onClose, 
  challengeId, 
  opponentName,
  onSubmit 
}: ReportResultModalProps) => {
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!score.trim()) {
      toast.error('Por favor, informe o placar do jogo');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        challengeId,
        result,
        score: score.trim(),
        notes: notes.trim() || undefined
      });

      toast.success('Resultado reportado com sucesso!');
      onClose();
      
      // Reset form
      setResult('win');
      setScore('');
      setNotes('');
    } catch (error) {
      console.error('Error reporting result:', error);
      toast.error('Erro ao reportar resultado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-blue" />
            Reportar Resultado
          </DialogTitle>
          <DialogDescription>
            Partida contra {opponentName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Resultado *</Label>
            <RadioGroup value={result} onValueChange={(value) => setResult(value as 'win' | 'loss')}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <RadioGroupItem value="win" id="win" />
                <Label htmlFor="win" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Vitória</p>
                      <p className="text-sm text-muted-foreground">Você venceu esta partida</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <RadioGroupItem value="loss" id="loss" />
                <Label htmlFor="loss" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold">Derrota</p>
                      <p className="text-sm text-muted-foreground">Você perdeu esta partida</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Placar *</Label>
            <Input
              id="score"
              placeholder="Ex: 6-4, 6-3 ou 3x1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Informe o placar da partida
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre a partida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
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
              {loading ? 'Salvando...' : 'Salvar Resultado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
