import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BookingPaymentButtonProps {
  courtId: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  pricePerHour: number;
  disabled?: boolean;
}

const BookingPaymentButton = ({
  courtId,
  courtName,
  bookingDate,
  startTime,
  endTime,
  totalHours,
  pricePerHour,
  disabled = false
}: BookingPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para fazer uma reserva.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          courtId,
          bookingDate,
          startTime,
          endTime,
          totalHours
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.open(data.url, '_blank');
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erro no Pagamento",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = totalHours * pricePerHour;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-2">Resumo da Reserva</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Quadra:</span>
            <span>{courtName}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span>{new Date(bookingDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Horário:</span>
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Duração:</span>
            <span>{totalHours}h</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1 mt-2">
            <span>Total:</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full"
        size="lg"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {loading ? "Processando..." : `Pagar R$ ${totalPrice.toFixed(2)}`}
      </Button>
    </div>
  );
};

export default BookingPaymentButton;