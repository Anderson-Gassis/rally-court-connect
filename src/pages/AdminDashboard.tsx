import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface RevenueStats {
  totalRevenue: number;
  tournamentRevenue: number;
  bookingRevenue: number;
  classRevenue: number;
  totalTransactions: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  platform_fee: number;
  date: string;
  user_email?: string;
  tournament_name?: string;
  court_name?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    tournamentRevenue: 0,
    bookingRevenue: 0,
    classRevenue: 0,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Acesso negado. Faça login como administrador.");
        navigate("/");
        return;
      }

      // Verificar se é admin (você pode adicionar um campo role='admin' na tabela profiles)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Por enquanto, vamos permitir acesso a todos usuários autenticados
      // Você pode adicionar verificação de role aqui: if (profile?.role !== 'admin')
      
      await fetchRevenueData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Erro ao verificar acesso");
      navigate("/");
    }
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Buscar receita de torneios
      const { data: tournamentData } = await supabase
        .from("tournament_registrations")
        .select(`
          id,
          platform_fee,
          registration_date,
          payment_status,
          user_id,
          tournament_id,
          tournaments:tournament_id (name)
        `)
        .eq("payment_status", "paid");

      // Buscar receita de reservas de quadras
      const { data: bookingData } = await supabase
        .from("bookings")
        .select(`
          id,
          platform_fee,
          created_at,
          payment_status,
          user_id,
          court_id,
          courts:court_id (name)
        `)
        .eq("payment_status", "paid");

      // Buscar receita de aulas
      const { data: classData } = await supabase
        .from("class_bookings")
        .select(`
          id,
          platform_fee,
          created_at,
          payment_status,
          student_id
        `)
        .eq("payment_status", "paid");

      // Calcular estatísticas
      const tournamentRevenue = tournamentData?.reduce((sum, t) => sum + (Number(t.platform_fee) || 0), 0) || 0;
      const bookingRevenue = bookingData?.reduce((sum, b) => sum + (Number(b.platform_fee) || 0), 0) || 0;
      const classRevenue = classData?.reduce((sum, c) => sum + (Number(c.platform_fee) || 0), 0) || 0;

      setStats({
        totalRevenue: tournamentRevenue + bookingRevenue + classRevenue,
        tournamentRevenue,
        bookingRevenue,
        classRevenue,
        totalTransactions: (tournamentData?.length || 0) + (bookingData?.length || 0) + (classData?.length || 0),
      });

      // Consolidar transações
      const allTransactions: Transaction[] = [
        ...(tournamentData?.map(t => ({
          id: t.id,
          type: 'Torneio',
          amount: Number(t.platform_fee) || 0,
          platform_fee: Number(t.platform_fee) || 0,
          date: t.registration_date,
          tournament_name: t.tournaments?.name,
        })) || []),
        ...(bookingData?.map(b => ({
          id: b.id,
          type: 'Reserva',
          amount: Number(b.platform_fee) || 0,
          platform_fee: Number(b.platform_fee) || 0,
          date: b.created_at,
          court_name: b.courts?.name,
        })) || []),
        ...(classData?.map(c => ({
          id: c.id,
          type: 'Aula',
          amount: Number(c.platform_fee) || 0,
          platform_fee: Number(c.platform_fee) || 0,
          date: c.created_at,
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Erro ao carregar dados de receita");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Visão geral da receita da plataforma</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Torneios</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {stats.tournamentRevenue.toFixed(2)}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reservas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.bookingRevenue.toFixed(2)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalTransactions}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="breakdown">Detalhamento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Torneios</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">R$ {stats.tournamentRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalRevenue > 0 ? ((stats.tournamentRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Reservas de Quadras</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">R$ {stats.bookingRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalRevenue > 0 ? ((stats.bookingRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Aulas</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">R$ {stats.classRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalRevenue > 0 ? ((stats.classRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total de Transações</p>
                      <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {stats.totalTransactions > 0 ? (stats.totalRevenue / stats.totalTransactions).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Taxa Média da Plataforma</p>
                      <p className="text-2xl font-bold text-blue-600">15%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Data</th>
                        <th className="text-left p-3 font-medium">Tipo</th>
                        <th className="text-left p-3 font-medium">Descrição</th>
                        <th className="text-right p-3 font-medium">Taxa Plataforma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'Torneio' ? 'bg-blue-100 text-blue-700' :
                              transaction.type === 'Reserva' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            {transaction.tournament_name || transaction.court_name || 'Aula particular'}
                          </td>
                          <td className="p-3 text-right font-medium text-green-600">
                            R$ {transaction.platform_fee.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            Nenhuma transação encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    Torneios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-blue-600">R$ {stats.tournamentRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">% da Receita</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0 ? ((stats.tournamentRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Reservas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-purple-600">R$ {stats.bookingRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">% da Receita</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0 ? ((stats.bookingRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-orange-600">R$ {stats.classRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">% da Receita</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0 ? ((stats.classRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
