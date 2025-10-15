import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { instructorsService } from "@/services/instructorsService";

interface InstructorBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructorId: string;
  instructorName: string;
  hourlyRate: number;
  trialAvailable: boolean;
  trialPrice: number;
}

const InstructorBookingModal = ({
  open,
  onOpenChange,
  instructorId,
  instructorName,
  hourlyRate,
  trialAvailable,
  trialPrice,
}: InstructorBookingModalProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [isTrialClass, setIsTrialClass] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);

  // Buscar horários disponíveis quando a data mudar
  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, instructorId]);

  const fetchAvailableSlots = async () => {
    if (!date) return;
    
    setLoadingSlots(true);
    try {
      // Buscar disponibilidade do instrutor
      const availability = await instructorsService.getInstructorAvailability(instructorId);
      const dayOfWeek = date.getDay();
      
      // Filtrar pela disponibilidade do dia da semana
      const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek && a.is_available);
      
      if (dayAvailability.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Buscar horários bloqueados
      const blockedTimes = await instructorsService.getBlockedTimes(
        instructorId,
        date.toISOString().split('T')[0],
        date.toISOString().split('T')[0]
      );

      // Gerar slots de 30 em 30 minutos
      const slots: string[] = [];
      dayAvailability.forEach(avail => {
        const [startHour, startMin] = avail.start_time.split(':').map(Number);
        const [endHour, endMin] = avail.end_time.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
          const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
          
          // Verificar se não está bloqueado
          const isBlocked = blockedTimes.some(blocked => {
            const blockDate = new Date(blocked.blocked_date).toDateString();
            const selectedDate = date.toDateString();
            return blockDate === selectedDate && 
                   timeString >= blocked.start_time && 
                   timeString < blocked.end_time;
          });
          
          if (!isBlocked) {
            slots.push(timeString);
          }
          
          // Avançar 30 minutos
          currentMin += 30;
          if (currentMin >= 60) {
            currentHour += 1;
            currentMin = 0;
          }
        }
      });
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Erro ao buscar horários disponíveis');
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
  };

  const totalHours = calculateHours();
  const price = isTrialClass ? trialPrice : (hourlyRate * totalHours);
  
  // Fee da plataforma: 15%
  const platformFee = price * 0.15;
  const instructorAmount = price - platformFee;

  const canProceed = useMemo(() => {
    return date && startTime && endTime && totalHours > 0;
  }, [date, startTime, endTime, totalHours]);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para agendar uma aula.");
      return;
    }

    if (!canProceed) {
      toast.error("Preencha todos os campos antes de prosseguir.");
      return;
    }

    setLoading(true);
    try {
      // Primeiro, criar a aula na tabela classes
      const classTitle = isTrialClass ? 'Aula Experimental' : 'Aula Individual';
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert({
          instructor_id: instructorId,
          title: classTitle,
          class_type: isTrialClass ? 'trial' : 'individual',
          description: `Aula agendada para ${date!.toLocaleDateString('pt-BR')}`,
          duration_minutes: totalHours * 60,
          price: price,
          max_students: 1
        })
        .select()
        .single();

      if (classError) throw classError;

      // Agora criar o booking com o class_id correto
      const { data: booking, error: bookingError } = await supabase
        .from('class_bookings')
        .insert({
          class_id: classData.id,
          student_id: user.id,
          instructor_id: instructorId,
          booking_date: date!.toISOString().split('T')[0],
          start_time: startTime!,
          end_time: endTime!,
          total_price: price,
          is_trial: isTrialClass,
          platform_fee: platformFee,
          instructor_amount: instructorAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Criar sessão de pagamento Stripe
      const { data, error } = await supabase.functions.invoke('create-instructor-class-payment', {
        body: {
          bookingId: booking.id,
          instructorId,
          bookingDate: date!.toISOString().split('T')[0],
          startTime: startTime!,
          endTime: endTime!,
          totalHours,
          isTrial: isTrialClass,
          amount: Math.round(price * 100)
        }
      });

      if (error) throw error;

      // Log da atividade
      await supabase.rpc('log_user_activity', {
        activity_type_param: 'class_booking_created',
        activity_data_param: {
          instructor_id: instructorId,
          booking_date: date!.toISOString().split('T')[0],
          total_price: price
        }
      });

      // Redirecionar para Stripe Checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Pagamento iniciado! Complete na nova aba.");
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="instructor-booking-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agendar Aula</DialogTitle>
        </DialogHeader>
        <p id="instructor-booking-description" className="sr-only">
          Selecione data e horários para agendar sua aula
        </p>

        <div className="space-y-6 pb-4">
          {/* Instructor Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">{instructorName}</h3>
            <p className="text-sm text-muted-foreground">
              Aula regular: R$ {hourlyRate}/hora
            </p>
            {trialAvailable && (
              <p className="text-sm text-green-600">
                Aula experimental disponível: R$ {trialPrice}
              </p>
            )}
          </div>

          {/* Trial Class Option */}
          {trialAvailable && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isTrialClass}
                  onChange={(e) => setIsTrialClass(e.target.checked)}
                  className="rounded"
                />
                Aula Experimental (preço especial)
              </Label>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Selecione a Data</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          {date && (
            <>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Carregando horários disponíveis...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum horário disponível para esta data. Tente outra data ou entre em contato com o professor.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Horário Início</Label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Horário Fim</Label>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots
                            .filter(time => !startTime || time > startTime)
                            .map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Summary */}
          {canProceed && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Resumo da Aula</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Professor:</span>
                  <span>{instructorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{date!.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span>{startTime} - {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span>{totalHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span>{isTrialClass ? 'Aula Experimental' : 'Aula Regular'}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1 mt-2">
                  <span>Total:</span>
                  <span>R$ {price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          {canProceed && (
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {loading ? "Processando..." : `Pagar R$ ${price.toFixed(2)}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructorBookingModal;
