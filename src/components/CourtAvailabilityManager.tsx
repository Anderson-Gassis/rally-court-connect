import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourtAvailabilityManagerProps {
  courtId: string;
}

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface BlockedTime {
  id?: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export default function CourtAvailabilityManager({ courtId }: CourtAvailabilityManagerProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [courtId]);

  const fetchAvailability = async () => {
    try {
      const [availabilityRes, blockedRes] = await Promise.all([
        supabase
          .from('court_availability')
          .select('*')
          .eq('court_id', courtId)
          .order('day_of_week'),
        supabase
          .from('court_blocked_times')
          .select('*')
          .eq('court_id', courtId)
          .gte('blocked_date', new Date().toISOString().split('T')[0])
          .order('blocked_date')
      ]);

      if (availabilityRes.error) throw availabilityRes.error;
      if (blockedRes.error) throw blockedRes.error;

      setAvailabilitySlots(availabilityRes.data || []);
      setBlockedTimes(blockedRes.data || []);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast.error('Erro ao carregar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = () => {
    setAvailabilitySlots([
      ...availabilitySlots,
      {
        day_of_week: 1,
        start_time: '08:00',
        end_time: '18:00',
        is_available: true,
      },
    ]);
  };

  const removeAvailabilitySlot = async (index: number) => {
    const slot = availabilitySlots[index];
    if (slot.id) {
      try {
        const { error } = await supabase
          .from('court_availability')
          .delete()
          .eq('id', slot.id);
        
        if (error) throw error;
        toast.success('Horário removido');
      } catch (error: any) {
        toast.error('Erro ao remover horário');
        return;
      }
    }
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availabilitySlots];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilitySlots(updated);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // Delete existing availability for this court
      await supabase
        .from('court_availability')
        .delete()
        .eq('court_id', courtId);

      // Insert new availability
      if (availabilitySlots.length > 0) {
        const { error } = await supabase
          .from('court_availability')
          .insert(
            availabilitySlots.map(slot => ({
              court_id: courtId,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_available: slot.is_available,
            }))
          );

        if (error) throw error;
      }

      toast.success('Disponibilidade salva com sucesso!');
      fetchAvailability();
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast.error('Erro ao salvar disponibilidade');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedTime = () => {
    setBlockedTimes([
      ...blockedTimes,
      {
        blocked_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '18:00',
        reason: '',
      },
    ]);
  };

  const removeBlockedTime = async (index: number) => {
    const blocked = blockedTimes[index];
    if (blocked.id) {
      try {
        const { error } = await supabase
          .from('court_blocked_times')
          .delete()
          .eq('id', blocked.id);
        
        if (error) throw error;
        toast.success('Bloqueio removido');
      } catch (error: any) {
        toast.error('Erro ao remover bloqueio');
        return;
      }
    }
    setBlockedTimes(blockedTimes.filter((_, i) => i !== index));
  };

  const updateBlockedTime = (index: number, field: keyof BlockedTime, value: any) => {
    const updated = [...blockedTimes];
    updated[index] = { ...updated[index], [field]: value };
    setBlockedTimes(updated);
  };

  const saveBlockedTimes = async () => {
    setSaving(true);
    try {
      // Delete existing blocked times
      await supabase
        .from('court_blocked_times')
        .delete()
        .eq('court_id', courtId);

      // Insert new blocked times
      if (blockedTimes.length > 0) {
        const { error } = await supabase
          .from('court_blocked_times')
          .insert(
            blockedTimes.map(blocked => ({
              court_id: courtId,
              blocked_date: blocked.blocked_date,
              start_time: blocked.start_time,
              end_time: blocked.end_time,
              reason: blocked.reason,
            }))
          );

        if (error) throw error;
      }

      toast.success('Bloqueios salvos com sucesso!');
      fetchAvailability();
    } catch (error: any) {
      console.error('Error saving blocked times:', error);
      toast.error('Erro ao salvar bloqueios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Horários Regulares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários Disponíveis (Semanal)
          </CardTitle>
          <CardDescription>
            Defina os horários em que sua quadra está disponível para locação durante a semana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availabilitySlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs mb-2 block">Dia da Semana</Label>
                  <select
                    value={slot.day_of_week}
                    onChange={(e) => updateAvailabilitySlot(index, 'day_of_week', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  >
                    {DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Início</Label>
                  <Input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => updateAvailabilitySlot(index, 'start_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Fim</Label>
                  <Input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => updateAvailabilitySlot(index, 'end_time', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={slot.is_available}
                    onCheckedChange={(checked) => updateAvailabilitySlot(index, 'is_available', checked)}
                  />
                  <Label className="text-xs">Ativo</Label>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeAvailabilitySlot(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={addAvailabilitySlot} variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </Button>
            <Button onClick={saveAvailability} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Disponibilidade'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bloqueios de Datas Específicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bloqueios Específicos
          </CardTitle>
          <CardDescription>
            Bloqueie datas e horários específicos (feriados, manutenção, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedTimes.map((blocked, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-red-50">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs mb-2 block">Data</Label>
                  <Input
                    type="date"
                    value={blocked.blocked_date}
                    onChange={(e) => updateBlockedTime(index, 'blocked_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Início</Label>
                  <Input
                    type="time"
                    value={blocked.start_time}
                    onChange={(e) => updateBlockedTime(index, 'start_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Fim</Label>
                  <Input
                    type="time"
                    value={blocked.end_time}
                    onChange={(e) => updateBlockedTime(index, 'end_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Motivo</Label>
                  <Input
                    placeholder="Ex: Manutenção"
                    value={blocked.reason || ''}
                    onChange={(e) => updateBlockedTime(index, 'reason', e.target.value)}
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeBlockedTime(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={addBlockedTime} variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Bloqueio
            </Button>
            <Button onClick={saveBlockedTimes} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Bloqueios'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Importante:</strong> Os horários configurados aqui serão os únicos disponíveis para locação.
          Clientes só poderão reservar nos dias e horários que você definir como disponíveis.
        </p>
      </div>
    </div>
  );
}
