import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  payment_status?: string;
  discount_percentage?: number;
  booking_quantity?: number;
  courts: {
    name: string;
    location: string;
    sport_type: string;
  };
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  open,
  onOpenChange,
}) => {
  if (!booking) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações completas sobre sua reserva
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{booking.courts.name}</h3>
              <p className="text-sm text-muted-foreground">{booking.courts.sport_type}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{booking.courts.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{booking.start_time} - {booking.end_time}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">R$ {booking.total_price.toFixed(2)}</span>
            </div>
          </div>

          {booking.discount_percentage && booking.discount_percentage > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Desconto aplicado:</strong> {booking.discount_percentage}%
              </p>
            </div>
          )}

          {booking.booking_quantity && booking.booking_quantity > 1 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Parte de um pacote de {booking.booking_quantity} reservas
              </p>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Status do pagamento:</strong>{' '}
              {booking.payment_status === 'paid' ? 'Pago' : 'Pendente'}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs text-amber-900">
              <strong>Política de cancelamento:</strong> Cancelamentos realizados com menos de 24 horas de antecedência não são reembolsáveis.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
