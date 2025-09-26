import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Trophy, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TournamentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [tournament, setTournament] = useState(null);
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const confirmRegistration = async () => {
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
        const { data, error } = await supabase.functions.invoke('confirm-tournament-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        setRegistration(data.registration);

        // Buscar dados do torneio
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', data.registration.tournament_id)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        toast({
          title: "Inscrição Confirmada!",
          description: "Sua inscrição no torneio foi processada com sucesso.",
        });
      } catch (error) {
        console.error("Error confirming tournament registration:", error);
        toast({
          title: "Erro",
          description: "Falha ao confirmar a inscrição. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    confirmRegistration();
  }, [sessionId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Confirmando sua inscrição...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-600">
              Inscrição Confirmada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournament && (
              <div className="space-y-3 text-left">
                <h3 className="font-semibold text-lg">{tournament.name}</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Data: {new Date(tournament.start_date).toLocaleDateString('pt-BR')} - {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Modalidade: {tournament.sport_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Status: Inscrito</span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link to="/player/dashboard">
                  Ver Meus Torneios
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/tournaments">
                  Buscar Outros Torneios
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TournamentSuccess;