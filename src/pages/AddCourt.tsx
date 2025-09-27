import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Upload, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { courtsService } from '@/services/courtsService';
import { toast } from 'sonner';

const AddCourt = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    sport_type: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    price_per_hour: '',
    image_url: '',
    description: '',
    features: [] as string[],
  });

  const availableFeatures = [
    'Iluminada',
    'Vestiário',
    'Estacionamento',
    'Cobertura',
    'Ar-condicionado',
    'Pro Shop',
    'Restaurante',
    'Bar',
    'Loja',
    'Arquibancada',
    'Pública',
    'Vestiário Premium'
  ];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter(f => f !== feature)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para cadastrar uma quadra');
      return;
    }

    setLoading(true);
    
    try {
      const courtData = {
        name: formData.name,
        type: formData.type,
        sport_type: formData.sport_type,
        location: formData.location,
        address: formData.address || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        price_per_hour: parseFloat(formData.price_per_hour),
        image_url: formData.image_url || null,
        description: formData.description || null,
        features: formData.features,
        owner_id: user.id,
        available: true,
      };

      await courtsService.createCourt(courtData);
      
      toast.success('Quadra cadastrada com sucesso!');
      navigate('/courts');
    } catch (error: any) {
      console.error('Erro ao cadastrar quadra:', error);
      
      if (error.message?.includes('new row violates row-level security')) {
        toast.error('Erro de permissão. Verifique se você está logado corretamente.');
      } else if (error.message?.includes('owner_id')) {
        toast.error('Erro de identificação do usuário. Tente fazer login novamente.');
      } else if (error.message?.includes('not-null constraint')) {
        toast.error('Preencha todos os campos obrigatórios.');
      } else {
        toast.error(error.message || 'Erro ao cadastrar quadra. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa estar logado para cadastrar uma quadra.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cadastre sua Quadra
              </h1>
              <p className="text-lg text-gray-600">
                Faça parte da rede Kourtify e conecte-se com milhares de jogadores
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações da Quadra
                </CardTitle>
                <CardDescription>
                  Preencha os dados da sua quadra para que os jogadores possam encontrá-la
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Quadra *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Academia Tennis Pro"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sport_type">Modalidade *</Label>
                      <Select 
                        value={formData.sport_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sport_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a modalidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tennis">Tênis</SelectItem>
                          <SelectItem value="padel">Padel</SelectItem>
                          <SelectItem value="beach-tennis">Beach Tennis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Piso *</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        placeholder="Ex: Saibro, Rápida, Areia, Vidro"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price_per_hour" className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Preço por Hora (R$) *
                      </Label>
                      <Input
                        id="price_per_hour"
                        type="number"
                        step="0.01"
                        value={formData.price_per_hour}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                        placeholder="Ex: 80.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Localização</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location">Bairro/Cidade *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Ex: Jardins, São Paulo"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço Completo</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Ex: Rua das Flores, 123"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude (opcional)</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          placeholder="Ex: -23.5629"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude (opcional)</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          placeholder="Ex: -46.6544"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      URL da Imagem
                    </Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Ex: https://exemplo.com/imagem-quadra.jpg"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva sua quadra, diferenciais, horário de funcionamento..."
                      rows={4}
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <Label>Comodidades Disponíveis</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {availableFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={formData.features.includes(feature)}
                            onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                          />
                          <Label 
                            htmlFor={feature}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/courts')}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-tennis-blue hover:bg-tennis-blue-dark"
                    >
                      {loading ? 'Cadastrando...' : 'Cadastrar Quadra'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddCourt;