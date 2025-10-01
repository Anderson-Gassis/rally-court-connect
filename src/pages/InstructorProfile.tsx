import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit, 
  Save, 
  Camera, 
  Phone, 
  MapPin, 
  Mail,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InstructorProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface InstructorInfo {
  id: string;
  specialization?: string[];
  experience_years?: number;
  certifications?: string[];
  hourly_rate: number;
  bio?: string;
  location?: string;
  trial_class_available: boolean;
  trial_class_price: number;
  verified: boolean;
}

const SPECIALIZATION_OPTIONS = [
  'Iniciante',
  'Crianças',
  'Mulheres',
  'Profissional',
  'Sparring',
  'Competição',
  'Condicionamento Físico',
  'Tática e Estratégia'
];

const InstructorProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [instructorInfo, setInstructorInfo] = useState<InstructorInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    specialization: [] as string[],
    experience_years: 0,
    certifications: [] as string[],
    hourly_rate: 0,
    bio: '',
    location: '',
    trial_class_available: true,
    trial_class_price: 0,
    new_certification: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (user?.role !== 'instructor') {
      navigate('/');
      toast.error('Acesso restrito a professores');
      return;
    }

    fetchInstructorProfile();
  }, [isAuthenticated, user, navigate]);

  const fetchInstructorProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: instructorData, error: instructorError } = await supabase
        .from('instructor_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (instructorError && instructorError.code !== 'PGRST116') throw instructorError;
      setInstructorInfo(instructorData);

      setEditData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        specialization: instructorData?.specialization || [],
        experience_years: instructorData?.experience_years || 0,
        certifications: instructorData?.certifications || [],
        hourly_rate: instructorData?.hourly_rate || 0,
        bio: instructorData?.bio || '',
        location: instructorData?.location || '',
        trial_class_available: instructorData?.trial_class_available ?? true,
        trial_class_price: instructorData?.trial_class_price || 0,
        new_certification: ''
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    setSaving(true);
    try {
      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name.trim(),
          phone: editData.phone.trim()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Atualizar ou inserir informações do instrutor
      const { error: instructorError } = await supabase
        .from('instructor_info')
        .upsert({
          user_id: user.id,
          specialization: editData.specialization,
          experience_years: editData.experience_years,
          certifications: editData.certifications,
          hourly_rate: editData.hourly_rate,
          bio: editData.bio.trim(),
          location: editData.location.trim(),
          trial_class_available: editData.trial_class_available,
          trial_class_price: editData.trial_class_price
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (instructorError) throw instructorError;

      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
      
      setTimeout(() => {
        fetchInstructorProfile();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev!, avatar_url: urlData.publicUrl }));
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  const toggleSpecialization = (spec: string) => {
    setEditData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const addCertification = () => {
    if (editData.new_certification.trim()) {
      setEditData(prev => ({
        ...prev,
        certifications: [...prev.certifications, prev.new_certification.trim()],
        new_certification: ''
      }));
    }
  };

  const removeCertification = (index: number) => {
    setEditData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (!isAuthenticated || user?.role !== 'instructor') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Perfil do Professor</h1>
                <p className="text-gray-600">Gerencie suas informações profissionais</p>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar e informações básicas */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-32 w-32 mx-auto">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="text-2xl">
                            {profile?.full_name?.charAt(0) || user?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90">
                            <Camera className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                          </label>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-semibold mt-4">
                        {profile?.full_name || user?.name}
                      </h2>
                      <p className="text-gray-600">{profile?.email}</p>
                      
                      <div className="flex justify-center mt-2">
                        {instructorInfo?.verified ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendente Verificação
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-3">
                      {profile?.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                      
                      {instructorInfo?.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{instructorInfo.location}</span>
                        </div>
                      )}

                      {instructorInfo?.hourly_rate && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="text-sm">R$ {instructorInfo.hourly_rate}/hora</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulário */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informações Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Suas informações de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={editData.full_name}
                            onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{profile?.full_name || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(11) 99999-9999"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{profile?.phone || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Profissionais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Informações Profissionais
                    </CardTitle>
                    <CardDescription>
                      Experiência e especialidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience_years">Anos de Experiência</Label>
                        {isEditing ? (
                          <Input
                            id="experience_years"
                            type="number"
                            min="0"
                            value={editData.experience_years}
                            onChange={(e) => setEditData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{instructorInfo?.experience_years || 0} anos</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Localização</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            value={editData.location}
                            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Ex: São Paulo, SP"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{instructorInfo?.location || 'Não informado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Especialidades</Label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          {SPECIALIZATION_OPTIONS.map((spec) => (
                            <div key={spec} className="flex items-center space-x-2">
                              <Checkbox
                                id={spec}
                                checked={editData.specialization.includes(spec)}
                                onCheckedChange={() => toggleSpecialization(spec)}
                              />
                              <Label htmlFor={spec} className="text-sm font-normal cursor-pointer">
                                {spec}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {instructorInfo?.specialization && instructorInfo.specialization.length > 0 ? (
                            instructorInfo.specialization.map((spec, index) => (
                              <Badge key={index} variant="outline">{spec}</Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">Nenhuma especialidade selecionada</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Conte sobre sua experiência, metodologia e conquistas..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-900 py-2 whitespace-pre-wrap">
                          {instructorInfo?.bio || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Valores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Valores e Aulas
                    </CardTitle>
                    <CardDescription>
                      Configure seus preços e disponibilidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Valor por Hora (R$)</Label>
                        {isEditing ? (
                          <Input
                            id="hourly_rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.hourly_rate}
                            onChange={(e) => setEditData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                          />
                        ) : (
                          <p className="text-gray-900 py-2">R$ {instructorInfo?.hourly_rate?.toFixed(2) || '0.00'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trial_class_price">Valor Aula Experimental (R$)</Label>
                        {isEditing ? (
                          <Input
                            id="trial_class_price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.trial_class_price}
                            onChange={(e) => setEditData(prev => ({ ...prev, trial_class_price: parseFloat(e.target.value) || 0 }))}
                            disabled={!editData.trial_class_available}
                          />
                        ) : (
                          <p className="text-gray-900 py-2">
                            {instructorInfo?.trial_class_available 
                              ? `R$ ${instructorInfo?.trial_class_price?.toFixed(2) || '0.00'}`
                              : 'Não disponível'}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="trial_class_available"
                          checked={editData.trial_class_available}
                          onCheckedChange={(checked) => 
                            setEditData(prev => ({ ...prev, trial_class_available: checked as boolean }))
                          }
                        />
                        <Label htmlFor="trial_class_available" className="cursor-pointer">
                          Oferecer aula experimental
                        </Label>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Certificações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certificações
                    </CardTitle>
                    <CardDescription>
                      Suas certificações e qualificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicionar nova certificação"
                          value={editData.new_certification}
                          onChange={(e) => setEditData(prev => ({ ...prev, new_certification: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                        />
                        <Button onClick={addCertification} type="button">
                          Adicionar
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {editData.certifications.length > 0 ? (
                        editData.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{cert}</span>
                            {isEditing && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeCertification(index)}
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          Nenhuma certificação adicionada
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstructorProfile;