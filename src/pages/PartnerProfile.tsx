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
import { 
  Building2, 
  Edit, 
  Save, 
  Camera, 
  Phone, 
  MapPin, 
  Globe,
  Mail,
  CheckCircle,
  AlertCircle,
  Star,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FeaturedListingPlans from '@/components/FeaturedListingPlans';

interface PartnerProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface PartnerInfo {
  business_name?: string;
  business_type?: string;
  contact_phone?: string;  
  contact_email?: string;
  description?: string;
  website_url?: string;
  business_address?: string;
  verified: boolean;
  cnpj?: string;
  specialization?: string;
  location?: string;
}

const PartnerProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    business_type: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    website_url: '',
    business_address: '',
    cnpj: '',
    specialization: '',
    location: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (user?.role !== 'partner') {
      navigate('/');
      toast.error('Acesso restrito a parceiros');
      return;
    }

    fetchPartnerProfile();
  }, [isAuthenticated, user, navigate]);

  const fetchPartnerProfile = async () => {
    if (!user) return;

    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Buscar informações do parceiro
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (partnerError && partnerError.code !== 'PGRST116') throw partnerError;
      setPartnerInfo(partnerData);

      // Preencher dados para edição
      setEditData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        business_name: partnerData?.business_name || '',
        business_type: partnerData?.business_type || '',
        contact_phone: partnerData?.contact_phone || '',
        contact_email: partnerData?.contact_email || '',
        description: partnerData?.description || '',
        website_url: partnerData?.website_url || '',
        business_address: partnerData?.business_address || '',
        cnpj: partnerData?.cnpj || '',
        specialization: partnerData?.specialization || '',
        location: partnerData?.location || ''
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

      if (profileError) {
        console.error('Profile update error:', profileError);
        if (profileError.code === 'PGRST301') {
          toast.error('Você não tem permissão para atualizar este perfil');
        } else {
          toast.error(`Erro ao atualizar perfil pessoal: ${profileError.message}`);
        }
        return;
      }

      // Atualizar ou inserir informações do parceiro
      const partnerUpdateData: any = {
        user_id: user.id,
        business_name: editData.business_name.trim(),
        business_type: editData.business_type.trim(),
        contact_phone: editData.contact_phone.trim(),
        contact_email: editData.contact_email.trim(),
        description: editData.description.trim(),
        website_url: editData.website_url.trim(),
        business_address: editData.business_address.trim(),
        cnpj: editData.cnpj.trim(),
      };

      // Adicionar campos de professor se fornecidos
      if (editData.specialization) {
        partnerUpdateData.specialization = editData.specialization.trim();
      }
      if (editData.location) {
        partnerUpdateData.location = editData.location.trim();
      }

      const { error: partnerError } = await supabase
        .from('partner_info')
        .upsert(partnerUpdateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (partnerError) {
        console.error('Partner info update error:', partnerError);
        if (partnerError.code === 'PGRST301') {
          toast.error('Você não tem permissão para atualizar informações de parceiro');
        } else {
          toast.error(`Erro ao atualizar informações do negócio: ${partnerError.message}`);
        }
        return;
      }

      // Atualizar estado local apenas se tudo foi bem-sucedido
      setProfile(prev => ({
        ...prev!,
        full_name: editData.full_name.trim(),
        phone: editData.phone.trim()
      }));

      setPartnerInfo(prev => ({
        ...prev!,
        business_name: editData.business_name.trim(),
        business_type: editData.business_type.trim(),
        contact_phone: editData.contact_phone.trim(),
        contact_email: editData.contact_email.trim(),
        description: editData.description.trim(),
        website_url: editData.website_url.trim(),
        business_address: editData.business_address.trim(),
        cnpj: editData.cnpj.trim(),
        specialization: editData.specialization.trim(),
        location: editData.location.trim()
      }));

      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
      
      // Recarregar dados para garantir sincronização
      setTimeout(() => {
        fetchPartnerProfile();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro inesperado ao atualizar perfil');
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

  if (!isAuthenticated || user?.role !== 'partner') {
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
                <h1 className="text-3xl font-bold text-gray-900">Perfil do Parceiro</h1>
                <p className="text-gray-600">Gerencie as informações do seu negócio</p>
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
                            {partnerInfo?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user?.name?.charAt(0) || 'P'}
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
                        {partnerInfo?.business_name || profile?.full_name || user?.name}
                      </h2>
                      <p className="text-gray-600">{profile?.email}</p>
                      
                      <div className="flex justify-center mt-2">
                        {partnerInfo?.verified ? (
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
                      {partnerInfo?.business_address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{partnerInfo.business_address}</span>
                        </div>
                      )}
                      
                      {partnerInfo?.contact_phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="text-sm">{partnerInfo.contact_phone}</span>
                        </div>
                      )}
                      
                      {partnerInfo?.website_url && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <span className="text-sm">{partnerInfo.website_url}</span>
                        </div>
                      )}

                      {partnerInfo?.business_type && (
                        <div className="flex items-center text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span className="text-sm">{partnerInfo.business_type}</span>
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
                      Suas informações de contato pessoais
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
                        <Label htmlFor="phone">Telefone Pessoal</Label>
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

                {/* Informações do Negócio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Informações do Negócio
                    </CardTitle>
                    <CardDescription>
                      Dados da sua empresa ou estabelecimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Nome da Empresa/Estabelecimento</Label>
                        {isEditing ? (
                          <Input
                            id="business_name"
                            value={editData.business_name}
                            onChange={(e) => setEditData(prev => ({ ...prev, business_name: e.target.value }))}
                            placeholder="Ex: Academia Tennis Pro"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.business_name || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_type">Tipo de Negócio</Label>
                        {isEditing ? (
                          <Input
                            id="business_type"
                            value={editData.business_type}
                            onChange={(e) => setEditData(prev => ({ ...prev, business_type: e.target.value }))}
                            placeholder="Ex: Academia, Clube, Arena"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.business_type || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Telefone Comercial</Label>
                        {isEditing ? (
                          <Input
                            id="contact_phone"
                            value={editData.contact_phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, contact_phone: e.target.value }))}
                            placeholder="(11) 99999-9999"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.contact_phone || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email Comercial</Label>
                        {isEditing ? (
                          <Input
                            id="contact_email"
                            type="email"
                            value={editData.contact_email}
                            onChange={(e) => setEditData(prev => ({ ...prev, contact_email: e.target.value }))}
                            placeholder="contato@empresa.com"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.contact_email || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website_url">Website</Label>
                        {isEditing ? (
                          <Input
                            id="website_url"
                            type="url"
                            value={editData.website_url}
                            onChange={(e) => setEditData(prev => ({ ...prev, website_url: e.target.value }))}
                            placeholder="https://www.empresa.com"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.website_url || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                        {isEditing ? (
                          <Input
                            id="cnpj"
                            value={editData.cnpj}
                            onChange={(e) => setEditData(prev => ({ ...prev, cnpj: e.target.value }))}
                            placeholder="00.000.000/0000-00"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{partnerInfo?.cnpj || 'Não informado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_address">Endereço Completo</Label>
                      {isEditing ? (
                        <Input
                          id="business_address"
                          value={editData.business_address}
                          onChange={(e) => setEditData(prev => ({ ...prev, business_address: e.target.value }))}
                          placeholder="Rua, número, bairro, cidade, estado"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{partnerInfo?.business_address || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição do Negócio</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva seu negócio, diferenciais, horários de funcionamento..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-900 py-2 min-h-[60px]">
                          {partnerInfo?.description || 'Nenhuma descrição adicionada ainda.'}
                        </p>
                      )}
                    </div>

                    {/* Campos específicos para Professores */}
                    {(partnerInfo?.business_type === 'Professor' || editData.business_type === 'Professor') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Especialização</Label>
                          {isEditing ? (
                            <Input
                              id="specialization"
                              value={editData.specialization}
                              onChange={(e) => setEditData(prev => ({ ...prev, specialization: e.target.value }))}
                              placeholder="Ex: Profissional, Amador, Categoria A, Infantil, Alto Rendimento"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{partnerInfo?.specialization || 'Não informado'}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Local de Atendimento</Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              value={editData.location}
                              onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Ex: São Paulo - Zona Sul, Rio de Janeiro - Barra"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{partnerInfo?.location || 'Não informado'}</p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Featured Listing Plans Section - Only for verified partners */}
                {partnerInfo?.verified && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Planos de Destaque
                      </CardTitle>
                      <CardDescription>
                        Aumente a visibilidade das suas quadras nos resultados de busca
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FeaturedListingPlans partnerId={user?.id} />
                    </CardContent>
                  </Card>
                )}

                {/* Status da Verificação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {partnerInfo?.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      )}
                      Status da Verificação de Parceiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {partnerInfo?.verified ? (
                      <div className="flex items-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-900">Parceiro Verificado</p>
                          <p className="text-sm text-green-700">
                            Sua conta foi verificada e aprovada pela equipe Kourtify. Você pode adicionar quadras e receber reservas normalmente.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                          <AlertCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">Análise em Andamento</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Seu cadastro foi recebido com sucesso e está em análise pela nossa equipe. 
                              Este processo normalmente leva até 24 horas.
                            </p>
                            <p className="text-sm text-blue-700 mt-2">
                              <strong>Importante:</strong> A verificação de parceiro é diferente da confirmação de email. 
                              Mesmo com o email confirmado, precisamos aprovar manualmente cada novo parceiro 
                              para garantir a qualidade da plataforma.
                            </p>
                            <p className="text-sm text-blue-700 mt-2">
                              Você será notificado por email quando a análise for concluída.
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>O que você pode fazer enquanto aguarda:</strong>
                          </p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                            <li>Complete todas as informações do seu perfil</li>
                            <li>Prepare as fotos e descrições das suas quadras</li>
                            <li>Verifique seus dados de contato</li>
                          </ul>
                        </div>
                      </div>
                    )}
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

export default PartnerProfile;