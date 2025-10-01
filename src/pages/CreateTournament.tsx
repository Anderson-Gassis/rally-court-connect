import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Calendar, Users, DollarSign } from 'lucide-react';

const tournamentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sport_type: z.string().min(1, 'Selecione um esporte'),
  location: z.string().min(3, 'Localização é obrigatória'),
  description: z.string().optional(),
  registration_start_date: z.string(),
  registration_deadline: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  entry_fee: z.string(),
  max_participants: z.string(),
  prize_pool: z.string().optional(),
  regulation: z.string().optional(),
});

type TournamentForm = z.infer<typeof tournamentSchema>;

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['singles']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['A']);

  const form = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: '',
      sport_type: 'tennis',
      location: '',
      description: '',
      entry_fee: '0',
      max_participants: '32',
      prize_pool: '0',
    },
  });

  const modalities = [
    { id: 'singles', label: 'Simples' },
    { id: 'doubles', label: 'Duplas' },
    { id: 'team', label: 'Torneio por Equipes' },
  ];

  const categories = [
    { id: 'A', label: 'Categoria A (Avançado)' },
    { id: 'B', label: 'Categoria B (Intermediário Avançado)' },
    { id: 'C', label: 'Categoria C (Intermediário)' },
    { id: 'D', label: 'Categoria D (Iniciante)' },
  ];

  const onSubmit = async (data: TournamentForm) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um torneio');
      return;
    }

    if (selectedModalities.length === 0) {
      toast.error('Selecione pelo menos uma modalidade');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Selecione pelo menos uma categoria');
      return;
    }

    setLoading(true);
    try {
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          name: data.name,
          sport_type: data.sport_type,
          location: data.location,
          description: data.description,
          registration_start_date: data.registration_start_date,
          registration_deadline: data.registration_deadline,
          start_date: data.start_date,
          end_date: data.end_date,
          entry_fee: Math.round(parseFloat(data.entry_fee) * 100),
          max_participants: parseInt(data.max_participants),
          prize_pool: data.prize_pool ? Math.round(parseFloat(data.prize_pool) * 100) : 0,
          regulation: data.regulation,
          modalities: selectedModalities,
          categories: selectedCategories,
          organizer_id: user.id,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Torneio criado com sucesso!');
      navigate(`/tournaments/${tournament.id}`);
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      toast.error('Erro ao criar torneio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center mb-8">
            <Trophy className="h-10 w-10 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Criar Novo Torneio</h1>
              <p className="text-muted-foreground">Organize e gerencie seu torneio esportivo</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados principais do torneio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Torneio *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Campeonato de Tênis 2025" {...field} />
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
                              <SelectValue placeholder="Selecione o esporte" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tennis">Tênis</SelectItem>
                            <SelectItem value="padel">Padel</SelectItem>
                            <SelectItem value="beach-tennis">Beach Tennis</SelectItem>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva seu torneio..."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modalidades e Categorias</CardTitle>
                  <CardDescription>Selecione as opções disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <FormLabel>Modalidades *</FormLabel>
                    <div className="space-y-2 mt-2">
                      {modalities.map((modality) => (
                        <div key={modality.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={modality.id}
                            checked={selectedModalities.includes(modality.id)}
                            onCheckedChange={(checked) => {
                              setSelectedModalities(
                                checked
                                  ? [...selectedModalities, modality.id]
                                  : selectedModalities.filter((m) => m !== modality.id)
                              );
                            }}
                          />
                          <label htmlFor={modality.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {modality.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Categorias *</FormLabel>
                    <div className="space-y-2 mt-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories(
                                checked
                                  ? [...selectedCategories, category.id]
                                  : selectedCategories.filter((c) => c !== category.id)
                              );
                            }}
                          />
                          <label htmlFor={category.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {category.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Datas e Inscrições</CardTitle>
                  <CardDescription>Configure os prazos do torneio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registration_start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Início das Inscrições *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registration_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo de Inscrição *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valores e Participantes</CardTitle>
                  <CardDescription>Configure os valores e limites</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="entry_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Inscrição (R$) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prize_pool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Premiação Total (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo de Participantes *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="8">8 jogadores</SelectItem>
                              <SelectItem value="16">16 jogadores</SelectItem>
                              <SelectItem value="32">32 jogadores</SelectItem>
                              <SelectItem value="64">64 jogadores</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regulamento</CardTitle>
                  <CardDescription>Adicione as regras e regulamento do torneio</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="regulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Digite o regulamento completo do torneio..."
                            className="resize-none min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Inclua todas as regras, formato do torneio, sistema de pontuação, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/tournaments')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Torneio'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateTournament;