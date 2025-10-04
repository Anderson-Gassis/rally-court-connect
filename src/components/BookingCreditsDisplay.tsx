import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingCredit {
  id: string;
  court_id: string;
  total_hours: number;
  remaining_hours: number;
  expires_at: string | null;
  created_at: string;
  courts: {
    name: string;
    location: string;
    price_per_hour: number;
  };
}

export default function BookingCreditsDisplay() {
  const [credits, setCredits] = useState<BookingCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('booking_credits')
        .select(`
          *,
          courts (
            name,
            location,
            price_per_hour
          )
        `)
        .eq('user_id', user.id)
        .gt('remaining_hours', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredits(data || []);
    } catch (error: any) {
      console.error('Error fetching credits:', error);
      toast.error('Erro ao carregar créditos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">Carregando créditos...</div>
        </CardContent>
      </Card>
    );
  }

  if (credits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Meus Créditos
          </CardTitle>
          <CardDescription>
            Você não possui créditos disponíveis no momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Quando você comprar pacotes com múltiplas sessões,</p>
            <p>seus créditos aparecerão aqui.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Meus Créditos
        </CardTitle>
        <CardDescription>
          Use seus créditos para agendar horários nas quadras
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {credits.map((credit) => (
          <div
            key={credit.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{credit.courts.name}</h3>
                <p className="text-sm text-muted-foreground">{credit.courts.location}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {credit.remaining_hours}h disponíveis
                  </Badge>
                  
                  {credit.expires_at && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Válido até {format(new Date(credit.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {credit.total_hours}h
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {(credit.total_hours * credit.courts.price_per_hour).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Usado: {(credit.total_hours - credit.remaining_hours).toFixed(1)}h de {credit.total_hours}h
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(credit.remaining_hours / credit.total_hours) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
