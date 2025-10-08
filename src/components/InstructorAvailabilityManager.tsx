import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, X } from 'lucide-react';
import { instructorsService, InstructorAvailability, BlockedTime } from '@/services/instructorsService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstructorAvailabilityManagerProps {
  instructorId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const InstructorAvailabilityManager: React.FC<InstructorAvailabilityManagerProps> = ({ instructorId }) => {
  const [availability, setAvailability] = useState<InstructorAvailability[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00'
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newBlock, setNewBlock] = useState({
    start_time: '09:00',
    end_time: '10:00',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [instructorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availabilityData, blockedData] = await Promise.all([
        instructorsService.getInstructorAvailability(instructorId),
        instructorsService.getBlockedTimes(
          instructorId,
          format(new Date(), 'yyyy-MM-dd'),
          format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        )
      ]);
      setAvailability(availabilityData);
      setBlockedTimes(blockedData);
    } catch (error) {
      toast.error('Erro ao carregar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const result = await instructorsService.createAvailability({
        instructor_id: instructorId,
        day_of_week: newAvailability.day_of_week,
        start_time: newAvailability.start_time,
        end_time: newAvailability.end_time,
        is_available: true
      });

      if (result) {
        toast.success('Disponibilidade adicionada!');
        setIsAddDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Erro ao adicionar disponibilidade');
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await instructorsService.deleteAvailability(id);
      toast.success('Disponibilidade removida!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover disponibilidade');
    }
  };

  const handleBlockTime = async () => {
    if (!selectedDate) {
      toast.error('Selecione uma data');
      return;
    }

    try {
      const result = await instructorsService.blockTime({
        instructor_id: instructorId,
        blocked_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: newBlock.start_time,
        end_time: newBlock.end_time,
        reason: newBlock.reason
      });

      if (result) {
        toast.success('Horário bloqueado!');
        setIsBlockDialogOpen(false);
        setNewBlock({ start_time: '09:00', end_time: '10:00', reason: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Erro ao bloquear horário');
    }
  };

  const handleUnblockTime = async (id: string) => {
    try {
      await instructorsService.deleteBlockedTime(id);
      toast.success('Bloqueio removido!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover bloqueio');
    }
  };

  const getDayLabel = (day: number) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disponibilidade Semanal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários Disponíveis
              </CardTitle>
              <CardDescription>
                Configure seus horários disponíveis para aulas durante a semana
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Horário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Horário Disponível</DialogTitle>
                  <DialogDescription>
                    Configure um novo horário semanal disponível para aulas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Dia da Semana</Label>
                    <Select
                      value={newAvailability.day_of_week.toString()}
                      onValueChange={(value) => setNewAvailability({ ...newAvailability, day_of_week: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Horário Inicial</Label>
                      <Select
                        value={newAvailability.start_time}
                        onValueChange={(value) => setNewAvailability({ ...newAvailability, start_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Horário Final</Label>
                      <Select
                        value={newAvailability.end_time}
                        onValueChange={(value) => setNewAvailability({ ...newAvailability, end_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddAvailability} className="w-full">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum horário disponível configurado. Adicione seus horários disponíveis.
            </div>
          ) : (
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailability = availability.filter(a => a.day_of_week === day.value);
                if (dayAvailability.length === 0) return null;

                return (
                  <div key={day.value} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{day.label}</h4>
                    <div className="space-y-2">
                      {dayAvailability.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvailability(slot.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloqueios de Horários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Bloqueios de Horários
              </CardTitle>
              <CardDescription>
                Bloqueie horários específicos por compromissos pessoais
              </CardDescription>
            </div>
            <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Bloquear Horário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bloquear Horário</DialogTitle>
                  <DialogDescription>
                    Bloqueie um horário específico para compromissos pessoais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                      locale={ptBR}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Horário Inicial</Label>
                      <Select
                        value={newBlock.start_time}
                        onValueChange={(value) => setNewBlock({ ...newBlock, start_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Horário Final</Label>
                      <Select
                        value={newBlock.end_time}
                        onValueChange={(value) => setNewBlock({ ...newBlock, end_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo (opcional)</Label>
                    <Textarea
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                      placeholder="Ex: Compromisso pessoal"
                    />
                  </div>

                  <Button onClick={handleBlockTime} className="w-full">
                    Bloquear
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {blockedTimes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum horário bloqueado
            </div>
          ) : (
            <div className="space-y-2">
              {blockedTimes.map((block) => (
                <div key={block.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">
                      {format(new Date(block.blocked_date), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                    </div>
                    {block.reason && (
                      <div className="text-xs text-gray-500 mt-1">
                        {block.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblockTime(block.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorAvailabilityManager;