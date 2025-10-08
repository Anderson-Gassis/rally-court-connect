import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Award, DollarSign, Calendar, Clock, CheckCircle, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import SafeLoading from '@/components/SafeLoading';

interface InstructorProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  location?: string;
}

interface InstructorInfo {
  id: string;
  user_id: string;
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

const InstructorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [instructorInfo, setInstructorInfo] = useState<InstructorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInstructorProfile();
    }
  }, [id]);

  const fetchInstructorProfile = async () => {
    try {
      if (!id) return;

      console.log('[InstructorPublicProfile] Buscando perfil para user_id:', id);

      // Fetch instructor info first (main data source)
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructor_info')
        .select('*')
        .eq('user_id', id)
        .single();

      if (instructorError) {
        console.error('[InstructorPublicProfile] Erro ao buscar instructor_info:', instructorError);
        throw new Error('Professor não encontrado');
      }

      if (!instructorData) {
        throw new Error('Professor não encontrado');
      }

      console.log('[InstructorPublicProfile] Instructor info encontrado:', instructorData);
      setInstructorInfo(instructorData);

      // Try to fetch profile data (optional, fallback to instructor_info)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

      if (profileData) {
        console.log('[InstructorPublicProfile] Profile encontrado:', profileData);
        setProfile(profileData);
      } else {
        console.log('[InstructorPublicProfile] Profile não encontrado, usando dados do instructor_info');
        // Create a minimal profile from instructor_info
        setProfile({
          user_id: instructorData.user_id,
          full_name: 'Professor', // Default name
          email: '',
          phone: '',
          avatar_url: undefined,
          location: instructorData.location || undefined
        });
      }
    } catch (error: any) {
      console.error('[InstructorPublicProfile] Erro:', error);
      toast.error(error.message || 'Erro ao carregar perfil do professor');
      navigate('/instructors');
    } finally {
      setLoading(false);
    }
  };

  const getInstructorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleScheduleClass = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para agendar uma aula');
      return;
    }
    toast.success('Em breve! Entre em contato diretamente com o professor para agendar.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <SafeLoading message="Carregando perfil..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile || !instructorInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Professor não encontrado</h3>
              <Button onClick={() => navigate('/instructors')}>
                Voltar para busca
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-tennis-blue text-white text-3xl font-semibold">
                    {getInstructorInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.full_name}
                    </h1>
                    {instructorInfo.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  {instructorInfo.location && (
                    <p className="text-gray-600 flex items-center mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {instructorInfo.location}
                    </p>
                  )}

                  {instructorInfo.bio && (
                    <p className="text-gray-700 leading-relaxed">
                      {instructorInfo.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="text-center md:text-right">
                    <div className="text-3xl font-bold text-tennis-blue">
                      R$ {instructorInfo.hourly_rate}
                    </div>
                    <div className="text-sm text-gray-600">por hora</div>
                  </div>
                  <Button 
                    onClick={handleScheduleClass}
                    className="bg-tennis-blue hover:bg-tennis-blue-dark text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Aula
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-tennis-blue" />
                  Experiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Anos de experiência</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {instructorInfo.experience_years || 0} anos
                    </p>
                  </div>
                  
                  {instructorInfo.certifications && instructorInfo.certifications.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Certificações</p>
                      <div className="flex flex-wrap gap-2">
                        {instructorInfo.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-tennis-blue" />
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructorInfo.specialization && instructorInfo.specialization.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {instructorInfo.specialization.map((spec, idx) => (
                      <Badge key={idx} className="bg-tennis-blue/10 text-tennis-blue">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma especialidade informada</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trial Class */}
          {instructorInfo.trial_class_available && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Aula Experimental Disponível</h3>
                      <p className="text-sm text-gray-600">
                        Experimente uma aula antes de fechar pacote
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {instructorInfo.trial_class_price}
                    </div>
                    <div className="text-sm text-gray-600">por aula</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-3 text-tennis-blue" />
                    <a href={`mailto:${profile.email}`} className="hover:text-tennis-blue">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-3 text-tennis-blue" />
                    <a href={`tel:${profile.phone}`} className="hover:text-tennis-blue">
                      {profile.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InstructorPublicProfile;
