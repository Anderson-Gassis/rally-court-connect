import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const partnerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  businessName: z.string().trim().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100),
  contactPhone: z.string().trim().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(20),
  businessType: z.string().trim().min(2, 'Tipo de negócio é obrigatório').max(50),
  description: z.string().trim().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
});

interface PartnerSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartnerSignupModal = ({ isOpen, onClose }: PartnerSignupModalProps) => {
  const { register, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    // Partner data
    businessName: '',
    contactPhone: '',
    businessType: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (step: number) => {
    try {
      if (step === 1) {
        // Validate basic user data
        z.object({
          name: partnerSchema.shape.name,
          email: partnerSchema.shape.email,
          password: partnerSchema.shape.password,
        }).parse({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Validate complete form
        partnerSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateForm(1)) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(2)) {
      toast.error('Por favor, corrija os erros do formulário');
      return;
    }

    try {
      // Register as partner user
      await register(formData.email.toLowerCase().trim(), formData.password, formData.name.trim(), 'partner', {
        businessName: formData.businessName.trim(),
        contactPhone: formData.contactPhone.trim(),
        businessType: formData.businessType.trim(),
        description: formData.description.trim() || undefined,
      });
      
      toast.success('Conta de parceiro criada com sucesso! Verifique seu email para confirmar a conta antes de fazer login.');
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        password: '',
        businessName: '',
        contactPhone: '',
        businessType: '',
        description: '',
      });
      setCurrentStep(1);
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error('Partner registration error:', error);
      
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('já está em uso') || errorMessage.includes('User already registered') || errorMessage.includes('already exists')) {
        toast.error('Este email já está em uso. Você já tem uma conta! Tente fazer login em vez de criar nova conta.');
      } else if (errorMessage.includes('Invalid email')) {
        toast.error('Email inválido. Verifique o formato do email.');
      } else if (errorMessage.includes('Password should be at least')) {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
      } else {
        toast.error(errorMessage || 'Erro ao criar conta de parceiro. Tente novamente.');
      }
    }
  };

  const benefits = [
    {
      icon: Building2,
      title: 'Gestão Completa',
      description: 'Dashboard profissional para gerenciar todas as suas quadras em um só lugar'
    },
    {
      icon: Users,
      title: 'Mais Clientes',
      description: 'Conecte-se com milhares de jogadores ativos na plataforma'
    },
    {
      icon: Zap,
      title: 'Automação Total',
      description: 'Sistema automatizado de reservas, pagamentos e gestão de horários'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Torne-se um Parceiro Kourtify
          </DialogTitle>
        </DialogHeader>
        
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-4">
                  <CardContent className="pt-4">
                    <benefit.icon className="h-8 w-8 text-tennis-blue mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Step 1 Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Nome Completo *</Label>
                <Input
                  id="partner-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partner-email">Email *</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partner-password">Senha *</Label>
                <Input
                  id="partner-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1 bg-tennis-blue hover:bg-tennis-blue-dark">
                  Continuar
                </Button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Informações do Negócio</h3>
              <p className="text-gray-600 text-sm">
                Conte-nos sobre sua empresa para completar o cadastro
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nome da Empresa/Estabelecimento *</Label>
                  <Input
                    id="business-name"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Ex: Academia Tennis Pro"
                    className={errors.businessName ? 'border-red-500' : ''}
                  />
                  {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Telefone de Contato *</Label>
                  <Input
                    id="contact-phone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className={errors.contactPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Tipo de Negócio *</Label>
                <Input
                  id="business-type"
                  value={formData.businessType}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                  placeholder="Ex: Academia, Clube, Condomínio, Arena"
                  className={errors.businessType ? 'border-red-500' : ''}
                />
                {errors.businessType && <p className="text-red-500 text-sm">{errors.businessType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva brevemente sua empresa e diferenciais..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Próximos passos:</strong> Após o cadastro, você poderá adicionar suas quadras 
                  e começar a receber reservas imediatamente. Nossa equipe entrará em contato em até 24h 
                  para verificação e aprovação.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-tennis-blue hover:bg-tennis-blue-dark"
                >
                  {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartnerSignupModal;