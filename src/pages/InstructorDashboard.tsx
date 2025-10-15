import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstructorAvailabilityManager from '@/components/InstructorAvailabilityManager';
import InstructorAdPlanSelector from '@/components/InstructorAdPlanSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Plus,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstructorProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface InstructorInfo {
  id: string;
  specialization?: string[];
  experience_years?: number;
  hourly_rate: number;
  bio?: string;
  verified: boolean;
  trial_class_available: boolean;
  trial_class_price: number;
  ad_plan?: string;
  payment_status?: string;
}

interface ClassBooking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_price: number;
  is_trial: boolean;
  student_id: string;
  notes?: string;
  profiles?: {
    full_name: string;
  };
}

interface Student {
  id: string;
  student_user_id: string;
  notes?: string;
  skill_level?: string;
  total_classes: number;
  active: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [instructorInfo, setInstructorInfo] = useState<InstructorInfo | null>(null);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Aguardar o loading terminar antes de verificar autenticação
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Permitir acesso para instrutores e admins
    if (user && user.role && !user.isInstructor && !user.isAdmin) {
      navigate('/');
      toast.error('Acesso restrito a professores');
      return;
    }

    // Só buscar dados se o user estiver completamente carregado
    if (user && user.role) {
      fetchInstructorData();
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  // Ler a aba da URL quando o componente montar ou os parâmetros mudarem
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchInstructorData = async () => {
    if (!user) return;

    try {
      // Buscar perfil do professor
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Buscar informações do professor
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructor_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (instructorError && instructorError.code !== 'PGRST116') throw instructorError;
      setInstructorInfo(instructorData);

      if (instructorData) {
        // Buscar aulas agendadas
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('class_bookings')
          .select('*')
          .eq('instructor_id', instructorData.id)
          .order('booking_date', { ascending: false })
          .limit(50);

        if (bookingsError) throw bookingsError;

        // Buscar nomes dos alunos
        const bookingsWithStudents = await Promise.all(
          (bookingsData || []).map(async (booking) => {
            const { data: studentData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', booking.student_id)
              .single();
            
            return {
              ...booking,
              profiles: studentData || { full_name: 'Aluno não encontrado' }
            };
          })
        );
        
        setBookings(bookingsWithStudents);

        // Buscar alunos cadastrados
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('instructor_id', instructorData.id)
          .eq('active', true);

        if (studentsError) throw studentsError;

        // Buscar informações dos alunos
        const studentsWithProfiles = await Promise.all(
          (studentsData || []).map(async (student) => {
            const { data: studentProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', student.student_user_id)
              .single();
            
            return {
              ...student,
              profiles: studentProfile || { full_name: 'Aluno', email: '' }
            };
          })
        );
        
        setStudents(studentsWithProfiles);
      }

    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Erro ao carregar dados do professor');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (!user?.isInstructor && !user?.isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa estar logado como professor para acessar esta área.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const activeStudents = students.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || user?.name}
                </h1>
                <p className="text-gray-600">{profile?.email || user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
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
                  {instructorInfo?.specialization && instructorInfo.specialization.length > 0 && (
                    <Badge variant="outline">{instructorInfo.specialization[0]}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/instructor/profile')}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alunos Ativos</p>
                    <p className="text-2xl font-bold">{activeStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aulas Agendadas</p>
                    <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingBookings.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Faturamento</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="schedule">Agenda</TabsTrigger>
              <TabsTrigger value="plans">Planos & Anúncios</TabsTrigger>
              <TabsTrigger value="students">Alunos</TabsTrigger>
              <TabsTrigger value="revenue">Faturamento</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Próximas Aulas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Próximas Aulas
                    </CardTitle>
                    <CardDescription>
                      Aulas agendadas para os próximos dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {confirmedBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{booking.profiles?.full_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(booking.booking_date), "dd 'de' MMMM", { locale: ptBR })} • {booking.start_time.slice(0, 5)}-{booking.end_time.slice(0, 5)}
                            </p>
                            {booking.is_trial && (
                              <Badge variant="outline" className="mt-1">Aula Experimental</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {booking.total_price.toFixed(2)}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                      {confirmedBookings.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Nenhuma aula agendada
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Alunos Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Alunos
                    </CardTitle>
                    <CardDescription>
                      Seus alunos cadastrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{student.profiles?.full_name}</p>
                            <p className="text-sm text-gray-600">{student.skill_level || 'Nível não definido'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{student.total_classes} aulas</p>
                          </div>
                        </div>
                      ))}
                      {students.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Nenhum aluno cadastrado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <InstructorAvailabilityManager instructorId={instructorInfo?.id || ''} />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Todas as Aulas</CardTitle>
                  <CardDescription>
                    Histórico completo de aulas agendadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{booking.profiles?.full_name}</p>
                            {booking.is_trial && (
                              <Badge variant="outline">Experimental</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.booking_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • {booking.start_time.slice(0, 5)}-{booking.end_time.slice(0, 5)}
                          </p>
                          {booking.notes && (
                            <p className="text-xs text-gray-500 mt-1">{booking.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {booking.total_price.toFixed(2)}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma aula agendada ainda
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planos de Destaque para Instrutores</CardTitle>
                  <CardDescription>
                    Escolha um plano para destacar seu perfil e aparecer nas primeiras posições
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {instructorInfo && (
                    <>
                      {instructorInfo.ad_plan && instructorInfo.ad_plan !== 'free' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            ✓ Plano Ativo: <span className="font-bold uppercase">{instructorInfo.ad_plan}</span>
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Seu anúncio está em destaque na plataforma
                          </p>
                        </div>
                      )}
                      <InstructorAdPlanSelector
                        instructorId={instructorInfo.id}
                        onSuccess={() => {
                          toast.success('Plano atualizado com sucesso!');
                          fetchInstructorData();
                        }}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Alunos</CardTitle>
                  <CardDescription>
                    Lista completa de alunos cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{student.profiles?.full_name}</p>
                            <p className="text-sm text-gray-600">{student.profiles?.email}</p>
                            <div className="mt-2 space-y-1">
                              {student.skill_level && (
                                <p className="text-sm">
                                  <span className="font-medium">Nível:</span> {student.skill_level}
                                </p>
                              )}
                              <p className="text-sm">
                                <span className="font-medium">Total de aulas:</span> {student.total_classes}
                              </p>
                              {student.notes && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Observações:</span> {student.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum aluno cadastrado ainda
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Faturamento
                  </CardTitle>
                  <CardDescription>
                    Análise de receitas e pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Recebido</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Aulas Concluídas</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {completedBookings.length}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Valor Médio/Aula</p>
                        <p className="text-2xl font-bold text-purple-600">
                          R$ {completedBookings.length > 0 ? (totalRevenue / completedBookings.length).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-4">Histórico de Pagamentos</h3>
                      <div className="space-y-3">
                        {completedBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.profiles?.full_name}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(booking.booking_date), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <p className="font-semibold text-green-600">
                              + R$ {booking.total_price.toFixed(2)}
                            </p>
                          </div>
                        ))}
                        {completedBookings.length === 0 && (
                          <p className="text-center text-gray-500 py-4">
                            Nenhum pagamento recebido ainda
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstructorDashboard;