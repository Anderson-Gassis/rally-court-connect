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
import { Badge } from "@/components/ui/badge";
import BookingPaymentButton from "./BookingPaymentButton";
import { bookingSchema } from "@/lib/validations/booking";
import { toast } from "sonner";
import { courtAvailabilityService } from "@/services/courtAvailabilityService";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtId: string;
  courtName: string;
  pricePerHour: number;
}

const BookingModal = ({
  open,
  onOpenChange,
  courtId,
  courtName,
  pricePerHour,
}: BookingModalProps) => {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [validationError, setValidationError] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isAvailable: boolean; reason?: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Buscar horários disponíveis quando a data mudar
  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, courtId]);

  const fetchAvailableSlots = async () => {
    if (!date) return;
    
    setLoadingSlots(true);
    try {
      const slots = await courtAvailabilityService.getAvailableTimeSlotsForDate(courtId, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Erro ao buscar horários disponíveis');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Filtrar apenas horários disponíveis para seleção
  const availableStartTimes = availableSlots.filter(slot => slot.isAvailable).map(slot => slot.time);
  const availableEndTimes = availableSlots.filter(slot => slot.isAvailable).map(slot => slot.time);

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
  };

  const totalHours = calculateHours();
  
  // Validar dados quando mudarem
  useEffect(() => {
    if (!date || !startTime || !endTime) {
      setValidationError(undefined);
      return;
    }
    
    try {
      bookingSchema.parse({
        courtId,
        date,
        startTime,
        endTime,
      });
      setValidationError(undefined);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Dados inválidos';
      setValidationError(errorMessage);
    }
  }, [courtId, date, startTime, endTime]);

  const canProceed = useMemo(() => {
    return date && startTime && endTime && totalHours > 0 && !validationError;
  }, [date, startTime, endTime, totalHours, validationError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto" aria-describedby="booking-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reservar Quadra</DialogTitle>
        </DialogHeader>
        <p id="booking-description" className="sr-only">
          Selecione data, horários e pacote para reservar a quadra
        </p>

        <div className="space-y-6 pb-4">
          {/* Court Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">{courtName}</h3>
            <p className="text-sm text-muted-foreground">
              R$ {pricePerHour}/hora
            </p>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Selecione a Data</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border pointer-events-auto"
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
              ) : availableStartTimes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum horário disponível para esta data. Tente outra data ou entre em contato com o parceiro.
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
                          {availableStartTimes.map((time) => (
                            <SelectItem key={time} value={time}>
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
                          {availableEndTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Horários definidos pelo parceiro:</strong> Apenas os horários disponíveis são exibidos.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Duration Info */}
          {totalHours > 0 && !validationError && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">
                Duração selecionada: <span className="text-primary">{totalHours}h</span>
              </p>
            </div>
          )}

          {/* Package Selection and Payment */}
          {canProceed && (
            <div className="space-y-4 pt-2 border-t">
              <h3 className="font-semibold text-lg">Escolha seu Pacote</h3>
              <BookingPaymentButton
                courtId={courtId}
                courtName={courtName}
                bookingDate={date.toISOString().split("T")[0]}
                startTime={startTime}
                endTime={endTime}
                totalHours={totalHours}
                pricePerHour={pricePerHour}
                onSuccess={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
