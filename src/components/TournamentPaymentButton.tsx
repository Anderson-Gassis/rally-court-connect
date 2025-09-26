import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TournamentPaymentButtonProps {
  tournamentId: string;
  tournamentName: string;
  entryFee: number;
  disabled?: boolean;
}

const TournamentPaymentButton = ({
  tournamentId,
  tournamentName,
  entryFee,
  disabled = false
}: TournamentPaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para se inscrever em um torneio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-tournament-payment', {
        body: {
          tournamentId
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

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Inscrição no Torneio
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Torneio:</span>
            <span>{tournamentName}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1 mt-2">
            <span>Taxa de Inscrição:</span>
            <span>R$ {(entryFee / 100).toFixed(2)}</span>
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
        {loading ? "Processando..." : `Inscrever-se - R$ ${(entryFee / 100).toFixed(2)}`}
      </Button>
    </div>
  );
};

export default TournamentPaymentButton;