import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InstructorAdPlanSelectorProps {
  instructorId: string;
  onSuccess?: () => void;
}

const PLANS = {
  free: {
    name: 'Grátis',
    price: 0,
    icon: Star,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    popular: false,
    features: [
      'Perfil visível na plataforma',
      'Anúncio básico',
      'Contato via plataforma',
      'Posição padrão nos resultados'
    ]
  },
  basic: {
    name: 'Básico',
    price: 29.90,
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    popular: true,
    features: [
      'Tudo do plano Grátis',
      'Badge "Professor Verificado"',
      'Prioridade nos resultados',
      'Até 3 fotos no perfil',
      'Estatísticas de visualizações'
    ]
  },
  premium: {
    name: 'Premium',
    price: 49.90,
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    popular: false,
    features: [
      'Tudo do plano Básico',
      'Destaque MÁXIMO nos resultados',
      'Badge "Professor Premium"',
      'Até 10 fotos no perfil',
      'Vídeo de apresentação',
      'Análises detalhadas',
      'Suporte prioritário'
    ]
  }
};

const DURATIONS = [
  { months: 1, label: '1 mês', discount: 0 },
  { months: 3, label: '3 meses', discount: 10 },
  { months: 6, label: '6 meses', discount: 15 },
  { months: 12, label: '12 meses', discount: 20 },
];

export default function InstructorAdPlanSelector({ instructorId, onSuccess }: InstructorAdPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium'>('basic');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [processing, setProcessing] = useState(false);

  const calculatePrice = (basePrice: number, months: number) => {
    const duration = DURATIONS.find(d => d.months === months);
    if (!duration || !duration.discount) return basePrice * months;
    
    const totalBeforeDiscount = basePrice * months;
    const discountAmount = totalBeforeDiscount * (duration.discount / 100);
    return totalBeforeDiscount - discountAmount;
  };

  const handleSelectPlan = async () => {
    if (selectedPlan === 'free') {
      toast.success('Plano Grátis ativado!');
      onSuccess?.();
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      const plan = PLANS[selectedPlan];
      const finalPrice = calculatePrice(plan.price, selectedDuration);
      const duration = DURATIONS.find(d => d.months === selectedDuration);

      const { data, error } = await supabase.functions.invoke('create-instructor-ad-payment', {
        body: {
          instructor_id: instructorId,
          plan_name: selectedPlan,
          duration_months: selectedDuration,
          amount: finalPrice,
          discount_percentage: duration?.discount || 0,
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecionando para pagamento...');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const selectedPlanData = PLANS[selectedPlan];
  const duration = DURATIONS.find(d => d.months === selectedDuration);
  const finalPrice = selectedPlan === 'free' ? 0 : calculatePrice(selectedPlanData.price, selectedDuration);
  const savings = selectedPlan === 'free' ? 0 : (selectedPlanData.price * selectedDuration) - finalPrice;

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === key;

          return (
            <Card
              key={key}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? `ring-2 ${plan.color.replace('text', 'ring')} ${plan.borderColor}` : ''
              }`}
              onClick={() => setSelectedPlan(key as typeof selectedPlan)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className={plan.bgColor}>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${plan.color}`} />
                  {isSelected && <Check className="h-5 w-5 text-green-600" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  {key === 'free' ? (
                    <span className="text-2xl font-bold text-gray-600">Grátis</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Duration Selection (only if not free) */}
      {selectedPlan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Escolha a Duração</CardTitle>
            <CardDescription>
              Quanto maior o período, maior o desconto!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DURATIONS.map((dur) => {
                const isSelected = selectedDuration === dur.months;
                const totalPrice = calculatePrice(selectedPlanData.price, dur.months);

                return (
                  <Card
                    key={dur.months}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setSelectedDuration(dur.months)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <p className="font-semibold">{dur.label}</p>
                        {dur.discount > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {dur.discount}% OFF
                          </Badge>
                        )}
                        <p className="text-2xl font-bold text-primary">
                          R$ {totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          R$ {(totalPrice / dur.months).toFixed(2)}/mês
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Action */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Plano selecionado:</span>
            <span className="font-semibold">{selectedPlanData.name}</span>
          </div>

          {selectedPlan !== 'free' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duração:</span>
                <span className="font-semibold">{duration?.label}</span>
              </div>

              {duration && duration.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Desconto:</span>
                  <span className="font-semibold">-R$ {savings.toFixed(2)} ({duration.discount}%)</span>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSelectPlan}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processando...' : selectedPlan === 'free' ? 'Ativar Plano Grátis' : 'Prosseguir para Pagamento'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
