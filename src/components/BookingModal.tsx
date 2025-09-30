import { useState } from "react";
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
import BookingPaymentButton from "./BookingPaymentButton";

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
  const canProceed = date && startTime && endTime && totalHours > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reservar Quadra</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              className="rounded-md border"
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

          {/* Payment Button */}
          {canProceed && (
            <BookingPaymentButton
              courtId={courtId}
              courtName={courtName}
              bookingDate={date.toISOString().split("T")[0]}
              startTime={startTime}
              endTime={endTime}
              totalHours={totalHours}
              pricePerHour={pricePerHour}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
