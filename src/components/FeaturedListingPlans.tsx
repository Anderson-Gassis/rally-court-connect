import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FeaturedPlan {
  type: 'semanal' | 'quinzenal' | 'mensal';
  name: string;
  duration: string;
  minPrice: number;
  maxPrice: number;
  icon: React.ReactNode;
  benefits: string[];
}

const FEATURED_PLANS: FeaturedPlan[] = [
  {
    type: 'semanal',
    name: 'Plano Semanal',
    duration: '7 dias',
    minPrice: 30,
    maxPrice: 50,
    icon: <Star className="h-5 w-5" />,
    benefits: [
      'Destaque nos resultados por 7 dias',
      'Posição prioritária nas buscas',
      'Badge de destaque na listagem'
    ]
  },
  {
    type: 'quinzenal',
    name: 'Plano Quinzenal',
    duration: '15 dias',
    minPrice: 50,
    maxPrice: 90,
    icon: <TrendingUp className="h-5 w-5" />,
    benefits: [
      'Destaque nos resultados por 15 dias',
      'Posição prioritária nas buscas',
      'Badge de destaque na listagem',
      'Economia de até 28% vs semanal'
    ]
  },
  {
    type: 'mensal',
    name: 'Plano Mensal',
    duration: '30 dias',
    minPrice: 90,
    maxPrice: 150,
    icon: <Sparkles className="h-5 w-5" />,
    benefits: [
      'Destaque nos resultados por 30 dias',
      'Posição prioritária nas buscas',
      'Badge de destaque na listagem',
      'Melhor custo-benefício',
      'Economia de até 50% vs semanal'
    ]
  }
];

interface FeaturedListingPlansProps {
  courtId?: string;
  partnerId?: string;
}

const FeaturedListingPlans = ({ courtId, partnerId }: FeaturedListingPlansProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectPlan = async (plan: FeaturedPlan) => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para contratar um plano de destaque.",
        variant: "destructive",
      });
      return;
    }

    if (!courtId && !partnerId) {
      toast({
        title: "Erro",
        description: "ID da quadra ou parceiro não fornecido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(plan.type);
    try {
      // Calcular datas
      const startDate = new Date();
      const endDate = new Date();
      
      if (plan.type === 'semanal') {
        endDate.setDate(endDate.getDate() + 7);
      } else if (plan.type === 'quinzenal') {
        endDate.setDate(endDate.getDate() + 15);
      } else {
        endDate.setDate(endDate.getDate() + 30);
      }

      // Criar registro de pagamento
      const { data: payment, error: paymentError } = await supabase
        .from('featured_listing_payments')
        .insert({
          court_id: courtId,
          partner_id: partnerId,
          plan_type: plan.type,
          price: (plan.minPrice + plan.maxPrice) / 2, // Média do preço
          payment_status: 'pending',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Aqui você pode integrar com Stripe ou outro gateway
      // Por enquanto, vamos apenas simular
      toast({
        title: "Plano Selecionado",
        description: `Plano ${plan.name} selecionado. Aguardando pagamento.`,
      });

      // TODO: Integrar com gateway de pagamento
      
    } catch (error) {
      console.error("Featured listing error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Destaque sua Listagem</h2>
        <p className="text-muted-foreground">
          Apareça no topo dos resultados e atraia mais clientes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURED_PLANS.map((plan) => {
          const isLoading = loading === plan.type;
          
          return (
            <Card 
              key={plan.type}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.type === 'mensal' ? 'border-primary' : ''
              }`}
            >
              {plan.type === 'mensal' && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  {plan.icon}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <CardDescription>
                  Destaque por {plan.duration}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    R$ {plan.minPrice} - {plan.maxPrice}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pagamento único
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.type === 'mensal' ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Selecionar Plano"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Benefícios do Destaque</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Apareça no topo dos resultados de busca</li>
          <li>• Destaque visual com badge especial</li>
          <li>• Aumente sua visibilidade em até 300%</li>
          <li>• Atraia mais clientes e reservas</li>
        </ul>
      </div>
    </div>
  );
};

export default FeaturedListingPlans;
