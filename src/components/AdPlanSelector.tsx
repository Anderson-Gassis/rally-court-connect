import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, TrendingUp } from 'lucide-react';

interface AdPlanSelectorProps {
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  adType: 'partner_search' | 'court' | 'instructor';
  baseAmount?: number;
}

const AdPlanSelector = ({ selectedPlan, onSelectPlan, adType, baseAmount = 0 }: AdPlanSelectorProps) => {
  const calculatePrice = (plan: string) => {
    if (plan === 'free') return 0;
    
    if (adType === 'partner_search') {
      return 19.90;
    } else if (adType === 'court' || adType === 'instructor') {
      return baseAmount * 0.15;
    }
    return 0;
  };

  const plans = [
    {
      name: 'free',
      displayName: 'Grátis',
      icon: Check,
      color: 'bg-gray-100 text-gray-700',
      features: [
        'Anúncio publicado',
        'Baixa visibilidade',
        'Final das pesquisas'
      ],
      price: 0
    },
    {
      name: 'basic',
      displayName: 'Básico',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
      features: [
        'Maior visibilidade',
        'Meio das pesquisas',
        'Destaque moderado'
      ],
      price: calculatePrice('basic')
    },
    {
      name: 'premium',
      displayName: 'Premium',
      icon: Zap,
      color: 'bg-primary/10 text-primary',
      badge: 'Mais Popular',
      features: [
        'Máxima visibilidade',
        'Topo das pesquisas',
        'Destaque garantido',
        'Badge de destaque'
      ],
      price: calculatePrice('premium')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Escolha o Plano do seu Anúncio</h3>
        <p className="text-sm text-muted-foreground">
          {adType === 'partner_search' 
            ? 'Valor fixo de R$ 19,90 para planos pagos'
            : 'Planos pagos: 15% do valor da ' + (adType === 'court' ? 'locação' : 'aula')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.name;
          
          return (
            <Card 
              key={plan.name}
              className={`relative cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary border-2 shadow-lg' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onSelectPlan(plan.name)}
            >
              {plan.badge && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                <CardDescription>
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold text-green-600">Grátis</span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-4"
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan !== 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-1">💡 Sobre o pagamento:</p>
          <p className="text-blue-800">
            O pagamento será processado após a criação do anúncio. 
            Seu anúncio só ficará ativo após a confirmação do pagamento.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdPlanSelector;