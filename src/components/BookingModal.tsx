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
import { AlertCircle } from "lucide-react";
import BookingPaymentButton from "./BookingPaymentButton";
import { bookingSchema } from "@/lib/validations/booking";
import { toast } from "sonner";

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

  // Generate time slots from 6am to 11pm
  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário Início</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
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
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
