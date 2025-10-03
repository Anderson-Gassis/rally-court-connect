import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Trophy, Calendar, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";

interface RevenueStats {
  totalRevenue: number;
  tournamentRevenue: number;
  bookingRevenue: number;
  classRevenue: number;
  adRevenue: number;
  featuredListingRevenue: number;
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
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    tournamentRevenue: 0,
    bookingRevenue: 0,
    classRevenue: 0,
    adRevenue: 0,
    featuredListingRevenue: 0,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchRevenueData();
    }
  }, [selectedMonth]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Acesso negado. Faça login como administrador.");
        navigate("/");
        return;
      }

      // Apenas o email específico tem acesso ao dashboard admin
      if (user.email !== 'anders.assis1985@gmail.com') {
        toast.error("Acesso negado. Você não tem permissão de administrador.");
        navigate("/");
        return;
      }
      
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

      // Calcular datas do período selecionado
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));

      console.log('Fetching data for period:', format(startDate, 'yyyy-MM-dd'), 'to', format(endDate, 'yyyy-MM-dd'));

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
        .eq("payment_status", "paid")
        .gte("registration_date", format(startDate, 'yyyy-MM-dd'))
        .lte("registration_date", format(endDate, 'yyyy-MM-dd'));

      // Buscar receita de reservas de quadras
      const { data: bookingData } = await supabase
        .from("bookings")
        .select(`
          id,
          platform_fee,
          total_price,
          created_at,
          payment_status,
          user_id,
          court_id,
          courts:court_id (name)
        `)
        .eq("payment_status", "paid")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Buscar receita de aulas
      const { data: classData } = await supabase
        .from("class_bookings")
        .select(`
          id,
          platform_fee,
          total_price,
          created_at,
          payment_status,
          student_id
        `)
        .eq("payment_status", "paid")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Buscar receita de anúncios (marketplace - parceiros e quadras)
      const { data: adData } = await supabase
        .from("ad_payments")
        .select(`
          id,
          amount,
          created_at,
          payment_status,
          ad_type,
          user_id
        `)
        .eq("payment_status", "paid")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Buscar receita de planos destaque de quadras
      const { data: featuredData } = await supabase
        .from("featured_listing_payments")
        .select(`
          id,
          price,
          created_at,
          payment_status,
          plan_type,
          partner_id,
          court_id
        `)
        .eq("payment_status", "paid")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Calcular estatísticas com 15% de taxa
      const tournamentRevenue = tournamentData?.reduce((sum, t) => sum + (Number(t.platform_fee) || 0), 0) || 0;
      
      // Para reservas, se não tiver platform_fee calculado, calcular 15% do total
      const bookingRevenue = bookingData?.reduce((sum, b) => {
        const fee = Number(b.platform_fee) || (Number(b.total_price) * 0.15);
        return sum + fee;
      }, 0) || 0;
      
      // Para aulas, se não tiver platform_fee calculado, calcular 15% do total
      const classRevenue = classData?.reduce((sum, c) => {
        const fee = Number(c.platform_fee) || (Number(c.total_price) * 0.15);
        return sum + fee;
      }, 0) || 0;
      
      // Para anúncios, calcular 15% do valor (a plataforma fica com 15%)
      const adRevenue = adData?.reduce((sum, a) => {
        const fee = Number(a.amount) * 0.15;
        return sum + fee;
      }, 0) || 0;
      
      // Para planos destaque, calcular 15% do valor
      const featuredListingRevenue = featuredData?.reduce((sum, f) => {
        const fee = Number(f.price) * 0.15;
        return sum + fee;
      }, 0) || 0;

      const totalRevenue = tournamentRevenue + bookingRevenue + classRevenue + adRevenue + featuredListingRevenue;

      setStats({
        totalRevenue,
        tournamentRevenue,
        bookingRevenue,
        classRevenue,
        adRevenue,
        featuredListingRevenue,
        totalTransactions: (tournamentData?.length || 0) + (bookingData?.length || 0) + (classData?.length || 0) + (adData?.length || 0) + (featuredData?.length || 0),
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
        ...(bookingData?.map(b => {
          const fee = Number(b.platform_fee) || (Number(b.total_price) * 0.15);
          return {
            id: b.id,
            type: 'Reserva',
            amount: fee,
            platform_fee: fee,
            date: b.created_at,
            court_name: b.courts?.name,
          };
        }) || []),
        ...(classData?.map(c => {
          const fee = Number(c.platform_fee) || (Number(c.total_price) * 0.15);
          return {
            id: c.id,
            type: 'Aula',
            amount: fee,
            platform_fee: fee,
            date: c.created_at,
          };
        }) || []),
        ...(adData?.map(a => {
          const fee = Number(a.amount) * 0.15;
          return {
            id: a.id,
            type: 'Anúncio',
            amount: fee,
            platform_fee: fee,
            date: a.created_at,
            tournament_name: `Plano ${a.ad_type}`,
          };
        }) || []),
        ...(featuredData?.map(f => {
          const fee = Number(f.price) * 0.15;
          return {
            id: f.id,
            type: 'Plano Destaque',
            amount: fee,
            platform_fee: fee,
            date: f.created_at,
            tournament_name: `Plano ${f.plan_type}`,
          };
        }) || []),
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
              <p className="text-gray-600">Visão geral da receita da plataforma</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = subMonths(new Date(), i);
                    const value = format(date, 'yyyy-MM');
                    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  <p className="text-sm text-gray-600">Aulas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {stats.classRevenue.toFixed(2)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Adicionais de Receita */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anúncios Marketplace</p>
                  <p className="text-2xl font-bold text-pink-600">
                    R$ {stats.adRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Planos Destaque</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    R$ {stats.featuredListingRevenue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Transações</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {stats.totalTransactions}
                  </p>
                </div>
                <Users className="h-8 w-8 text-teal-600" />
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

                    <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-pink-600" />
                        <span className="font-medium">Anúncios Marketplace</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">R$ {stats.adRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalRevenue > 0 ? ((stats.adRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium">Planos Destaque</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">R$ {stats.featuredListingRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalRevenue > 0 ? ((stats.featuredListingRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
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
                              transaction.type === 'Aula' ? 'bg-orange-100 text-orange-700' :
                              transaction.type === 'Anúncio' ? 'bg-pink-100 text-pink-700' :
                              'bg-indigo-100 text-indigo-700'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-pink-600" />
                    Anúncios Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-pink-600">R$ {stats.adRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">% da Receita</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0 ? ((stats.adRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Planos Destaque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-indigo-600">R$ {stats.featuredListingRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">% da Receita</span>
                      <span className="font-medium">
                        {stats.totalRevenue > 0 ? ((stats.featuredListingRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
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
