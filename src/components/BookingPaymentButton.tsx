import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BookingPackageSelector from "./BookingPackageSelector";

interface BookingPaymentButtonProps {
  courtId: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  pricePerHour: number;
  disabled?: boolean;
  onSuccess?: () => void;
}

const BookingPaymentButton = ({
  courtId,
  courtName,
  bookingDate,
  startTime,
  endTime,
  totalHours,
  pricePerHour,
  disabled = false,
  onSuccess
}: BookingPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calcular desconto baseado na quantidade
  const getDiscount = (quantity: number) => {
    if (quantity === 1) return 0;
    if (quantity === 2) return 7;
    return 13; // 3 ou mais
  };

  const discount = getDiscount(selectedQuantity);
  const basePrice = totalHours * pricePerHour * selectedQuantity;
  const discountAmount = basePrice * (discount / 100);
  const totalPrice = basePrice - discountAmount;
  
  // Comissão da plataforma: 15%
  const platformFee = totalPrice * 0.15;
  const partnerAmount = totalPrice - platformFee;

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
      // First create the booking record with monetization data
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          court_id: courtId,
          user_id: user.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_price: totalPrice,
          booking_quantity: selectedQuantity,
          discount_percentage: discount,
          platform_fee: platformFee,
          partner_amount: partnerAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Stripe payment session
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          bookingId: booking.id,
          courtId,
          bookingDate,
          startTime,
          endTime,
          totalHours,
          bookingQuantity: selectedQuantity,
          amount: Math.round(totalPrice * 100)
        }
      });

      if (error) throw error;

      // Log the booking activity
      await supabase.rpc('log_user_activity', {
        activity_type_param: 'booking_created',
        activity_data_param: {
          court_id: courtId,
          booking_date: bookingDate,
          total_price: totalHours * pricePerHour
        }
      });

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Pagamento Iniciado",
          description: "Complete o pagamento na nova aba aberta.",
        });
        // Close modal after opening payment
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        throw new Error("URL de pagamento não recebida");
      }
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

  return (
    <div className="space-y-4">
      <BookingPackageSelector
        selectedQuantity={selectedQuantity}
        onSelectQuantity={setSelectedQuantity}
        pricePerHour={pricePerHour}
        totalHours={totalHours}
      />

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
            <span>Duração por sessão:</span>
            <span>{totalHours}h</span>
          </div>
          <div className="flex justify-between">
            <span>Quantidade de sessões:</span>
            <span>{selectedQuantity}x</span>
          </div>
          {discount > 0 && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="line-through">R$ {basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Desconto ({discount}%):</span>
                <span>-R$ {discountAmount.toFixed(2)}</span>
              </div>
            </>
          )}
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