import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, MapPin, Calendar, Plus, Trophy, Search, Upload, Sparkles } from 'lucide-react';
import AdPlanSelector from '@/components/AdPlanSelector';

const partnerSearchSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  sport_type: z.string().min(1, 'Selecione um esporte'),
  skill_level: z.string().optional(),
  location: z.string().min(2, 'Localização é obrigatória'),
  preferred_date: z.string().optional(),
  image_url: z.string().optional(),
});

type PartnerSearchForm = z.infer<typeof partnerSearchSchema>;

const FindPartner = () => {
  const { user, isAuthenticated } = useAuth();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<PartnerSearchForm>({
    resolver: zodResolver(partnerSearchSchema),
    defaultValues: {
      sport_type: 'Tênis',
    },
  });

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_search')
        .select(`
          *,
          profiles:user_id (
            full_name,
            skill_level,
            location
          )
        `)
        .eq('status', 'active')
        .order('ad_plan', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ordenar por prioridade de plano (premium > basic > free)
      const sortedData = (data || []).sort((a, b) => {
        const planPriority = { premium: 2, basic: 1, free: 0 };
        return (planPriority[b.ad_plan as keyof typeof planPriority] || 0) - 
               (planPriority[a.ad_plan as keyof typeof planPriority] || 0);
      });
      
      setSearches(sortedData);
    } catch (error: any) {
      console.error('Error fetching searches:', error);
      toast.error('Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !user) return null;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `partner-${user.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('court-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('court-images')
        .getPublicUrl(fileName);

      return publicUrl.publicUrl;
    } catch (error: any) {
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: PartnerSearchForm) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const insertData: any = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        sport_type: data.sport_type,
        skill_level: data.skill_level,
        location: data.location,
        preferred_date: data.preferred_date || null,
        status: 'active',
        ad_plan: selectedPlan,
        image_url: data.image_url || null,
        payment_status: selectedPlan === 'free' ? 'completed' : 'pending',
      };

      const { data: newAd, error } = await supabase
        .from('partner_search')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Se plano pago, redirecionar para pagamento
      if (selectedPlan !== 'free') {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'create-ad-payment',
          {
            body: {
              adType: 'partner_search',
              adId: newAd.id,
              planName: selectedPlan,
              baseAmount: 19.90,
            },
          }
        );

        if (paymentError) throw paymentError;

        toast.success('Redirecionando para pagamento...');
        window.open(paymentData.url, '_blank');
      } else {
        toast.success('Anúncio criado com sucesso!');
      }

      setIsDialogOpen(false);
      form.reset();
      setSelectedPlan('free');
      fetchSearches();
    } catch (error: any) {
      console.error('Error creating search:', error);
      toast.error('Erro ao criar anúncio');
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partner_search')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Anúncio removido');
      fetchSearches();
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast.error('Erro ao remover anúncio');
    }
  };

  const filteredSearches = searches.filter(search => {
    const matchesSearch = search.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          search.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === 'all' || search.sport_type === sportFilter;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-primary mr-3" />
              <div>
                <h1 className="text-3xl font-bold">Encontre seu Parceiro</h1>
                <p className="text-muted-foreground">Conecte-se com jogadores para duplas e treinos</p>
              </div>
            </div>
            
            {isAuthenticated && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Anúncio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Anúncio</DialogTitle>
                    <DialogDescription>
                      Preencha as informações para encontrar o parceiro ideal
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <AdPlanSelector
                        selectedPlan={selectedPlan}
                        onSelectPlan={setSelectedPlan}
                        adType="partner_search"
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Procuro parceiro para duplas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sport_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esporte *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Tênis">Tênis</SelectItem>
                                <SelectItem value="Padel">Padel</SelectItem>
                                <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skill_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível Desejado</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Iniciante">Iniciante</SelectItem>
                                <SelectItem value="Intermediário">Intermediário</SelectItem>
                                <SelectItem value="Avançado">Avançado</SelectItem>
                                <SelectItem value="Profissional">Profissional</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo, SP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferred_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Preferencial</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Conte mais sobre o que você procura..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Upload className="h-4 w-4" />
                              Foto do Anúncio (opcional)
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingImage}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await handleImageUpload(file);
                                      if (url) field.onChange(url);
                                    }
                                  }}
                                />
                                {uploadingImage && (
                                  <p className="text-sm text-gray-500">Fazendo upload...</p>
                                )}
                                {field.value && (
                                  <img 
                                    src={field.value} 
                                    alt="Preview" 
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Criar Anúncio</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar anúncios..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por esporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os esportes</SelectItem>
                <SelectItem value="Tênis">Tênis</SelectItem>
                <SelectItem value="Padel">Padel</SelectItem>
                <SelectItem value="Beach Tennis">Beach Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando anúncios...</p>
            </div>
          ) : filteredSearches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Seja o primeiro a criar um anúncio!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSearches.map((search: any) => (
                <Card 
                  key={search.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    search.ad_plan === 'premium' ? 'border-primary border-2' : ''
                  }`}
                >
                  {search.image_url && (
                    <img 
                      src={search.image_url} 
                      alt={search.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Badge variant="default">{search.sport_type}</Badge>
                        {search.ad_plan === 'premium' && (
                          <Badge className="bg-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {search.ad_plan === 'basic' && (
                          <Badge variant="secondary">Básico</Badge>
                        )}
                      </div>
                      {user?.id === search.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSearch(search.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{search.title}</CardTitle>
                    <CardDescription>
                      por {search.profiles?.full_name || 'Jogador'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {search.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{search.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {search.location}
                      </div>
                      {search.skill_level && (
                        <div className="flex items-center text-sm">
                          <Trophy className="h-4 w-4 mr-1" />
                          Nível: {search.skill_level}
                        </div>
                      )}
                      {search.preferred_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(search.preferred_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <div className="pt-3">
                        <p className="text-xs text-gray-500">
                          Publicado em {new Date(search.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FindPartner;