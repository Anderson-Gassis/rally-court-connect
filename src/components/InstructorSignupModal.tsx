import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, BookOpen, Star, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const instructorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
  specialization: z.array(z.string()).min(1, 'Selecione pelo menos uma especialidade'),
  experience_years: z.number().min(0, 'Anos de experiência deve ser >= 0'),
  hourly_rate: z.number().min(0, 'Valor por hora deve ser >= 0'),
  bio: z.string().optional(),
  location: z.string().optional(),
});

interface InstructorSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIALIZATION_OPTIONS = [
  'Profissional',
  'Amador',
  'Categoria A',
  'Categoria B',
  'Categoria C',
  'Crianças',
  'Mulheres',
  'Sparring',
  'Competição',
  'Condicionamento Físico',
  'Tática e Estratégia'
];

const InstructorSignupModal: React.FC<InstructorSignupModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    specialization: [] as string[],
    experience_years: 0,
    hourly_rate: 0,
    bio: '',
    location: '',
  });

  const validateForm = () => {
    try {
      if (currentStep === 1) {
        z.object({
          email: instructorSchema.shape.email,
          password: instructorSchema.shape.password,
          full_name: instructorSchema.shape.full_name,
          phone: instructorSchema.shape.phone,
        }).parse({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        });
      } else {
        z.object({
          specialization: instructorSchema.shape.specialization,
          experience_years: instructorSchema.shape.experience_years,
          hourly_rate: instructorSchema.shape.hourly_rate,
        }).parse({
          specialization: formData.specialization,
          experience_years: formData.experience_years,
          hourly_rate: formData.hourly_rate,
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.full_name,
        'instructor',
        {
          specialization: formData.specialization,
          experience_years: formData.experience_years,
          hourly_rate: formData.hourly_rate,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
        }
      );
      
      // Se chegou aqui sem erro, o email já estava confirmado (raro)
      toast.success('Cadastro realizado com sucesso!');
      onClose();
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        specialization: [],
        experience_years: 0,
        hourly_rate: 0,
        bio: '',
        location: '',
      });
      setCurrentStep(1);
      setShowSuccessScreen(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Se for erro de confirmação necessária, mostrar tela de sucesso
      if (error.message === 'CONFIRMATION_REQUIRED') {
        setShowSuccessScreen(true);
      } else {
        toast.error(error.message || 'Erro ao realizar cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessScreen(false);
    onClose();
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      specialization: [],
      experience_years: 0,
      hourly_rate: 0,
      bio: '',
      location: '',
    });
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccessScreen ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">✅ Cadastro Realizado!</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg text-green-900">
                      Bem-vindo à equipe de professores!
                    </h3>
                    <p className="text-sm text-green-800">
                      Seu cadastro foi realizado com sucesso. Para continuar, você precisa confirmar seu email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold text-blue-900">📧 Próximos Passos:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Verifique sua caixa de entrada no email <strong>{formData.email}</strong></li>
                  <li>Abra o email de confirmação que enviamos</li>
                  <li>Clique no link de confirmação</li>
                  <li>Faça login na plataforma e comece a receber alunos!</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                  💡 Dica: Se não encontrar o email, verifique sua pasta de spam ou lixo eletrônico.
                </p>
              </div>

              <Button onClick={handleCloseSuccess} className="w-full">
                Entendi, vou verificar meu email
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Cadastro de Professor</DialogTitle>
              <DialogDescription>
                Preencha suas informações para começar a dar aulas na plataforma
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  Benefícios de ser Professor
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>Receba alunos automaticamente através da plataforma</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Gerencie sua agenda e faturamento em um só lugar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>Ganhe visibilidade e credibilidade profissional</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <Button type="button" onClick={handleNext} className="w-full">
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Especialidades * (selecione pelo menos uma)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={`spec-${spec}`}
                          checked={formData.specialization.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <Label htmlFor={`spec-${spec}`} className="text-sm font-normal cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.specialization && (
                    <p className="text-sm text-red-500">{errors.specialization}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Anos de Experiência *</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        experience_years: parseInt(e.target.value) || 0 
                      }))}
                    />
                    {errors.experience_years && (
                      <p className="text-sm text-red-500">{errors.experience_years}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Valor por Hora (R$) *</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        hourly_rate: parseFloat(e.target.value) || 0 
                      }))}
                    />
                    {errors.hourly_rate && (
                      <p className="text-sm text-red-500">{errors.hourly_rate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre Você</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte sobre sua experiência, metodologia e conquistas..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                </Button>
              </div>
            </div>
          )}
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstructorSignupModal;