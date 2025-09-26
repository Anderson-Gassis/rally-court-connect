import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CheckCircle, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const confirmBooking = async () => {
      if (!sessionId) {
        toast({
          title: "Erro",
          description: "Session ID não encontrado",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-booking-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        setBooking(data.booking);
        toast({
          title: "Reserva Confirmada!",
          description: "Sua reserva foi processada com sucesso.",
        });
      } catch (error) {
        console.error("Error confirming booking:", error);
        toast({
          title: "Erro",
          description: "Falha ao confirmar a reserva. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [sessionId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Confirmando sua reserva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Reserva Confirmada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking && (
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Data: {new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horário: {booking.start_time} - {booking.end_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span>Valor: R$ {booking.total_price.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link to="/player/dashboard">
                  Ir para Minhas Reservas
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/courts">
                  Fazer Nova Reserva
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingSuccess;