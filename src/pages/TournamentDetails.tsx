import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Calendar, MapPin, Users, DollarSign, FileText, Grid3x3, Download } from 'lucide-react';
import TournamentBracket from '@/components/TournamentBracket';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TournamentPaymentButton from '@/components/TournamentPaymentButton';
import { TournamentMatchManager } from '@/components/TournamentMatchManager';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [canGenerateBracket, setCanGenerateBracket] = useState(false);
  const [registrationsClosed, setRegistrationsClosed] = useState(false);
  const [bracketMatches, setBracketMatches] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
    }
  }, [id, user]);

  // Auto-refresh when payments are confirmed
  useEffect(() => {
    if (!id) return;

    // Subscribe to realtime updates for tournament registrations
    const channel = supabase
      .channel('tournament-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_registrations',
          filter: `tournament_id=eq.${id}`
        },
        (payload) => {
          console.log('Registration updated:', payload);
          // Refresh tournament details when a registration changes
          fetchTournamentDetails();
          toast.success('Nova inscrição confirmada!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleExportBracketPDF = async () => {
    try {
      const bracketEl = document.getElementById('bracket-container');
      if (!bracketEl) return toast.error('Chave não encontrada na página');
      const canvas = await html2canvas(bracketEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 20;
      // Title
      pdf.setFontSize(14);
      pdf.text(`Chave do Torneio: ${tournament?.name || ''}`, 20, y);
      y += 10;
      // Add image, split into pages if needed
      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(imgData, 'PNG', 20, y + 10, imgWidth, imgHeight);
      } else {
        let position = 0;
        let remainingHeight = imgHeight;
        const pageImgHeight = pageHeight - 60; // account for margins and title
        while (remainingHeight > 0) {
          const canvasPage = document.createElement('canvas');
          canvasPage.width = canvas.width;
          canvasPage.height = Math.min(canvas.height, Math.round((pageImgHeight * canvas.width) / imgWidth));
          const ctx = canvasPage.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, position, canvas.width, canvasPage.height, 0, 0, canvasPage.width, canvasPage.height);
            const pageData = canvasPage.toDataURL('image/png');
            if (position > 0) pdf.addPage();
            pdf.addImage(pageData, 'PNG', 20, 40, imgWidth, pageImgHeight);
            position += canvasPage.height;
            remainingHeight -= pageImgHeight;
          } else {
            break;
          }
        }
      }
      pdf.save(`chave-${tournament?.name || 'torneio'}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar PDF', err);
      toast.error('Erro ao exportar PDF da chave');
    }
  };

  const fetchTournamentDetails = async () => {
    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch registrations with payment_status = 'paid'
      const { data: regsData, error: regsError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', id)
        .eq('payment_status', 'paid');

      if (regsError) throw regsError;

      // Fetch profiles for registered users
      if (regsData && regsData.length > 0) {
        const userIds = regsData.map((reg: any) => reg.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, ranking_points, skill_level')
          .in('user_id', userIds);

        if (!profilesError && profilesData) {
          // Merge profiles data with registrations
          const mergedData = regsData.map((reg: any) => ({
            ...reg,
            profiles: profilesData.find((p: any) => p.user_id === reg.user_id)
          }));
          setRegistrations(mergedData);
        } else {
          setRegistrations(regsData || []);
        }
      } else {
        setRegistrations([]);
      }

      // Check if user is registered
      if (user && regsData) {
        const userReg = regsData.find((reg: any) => reg.user_id === user.id);
        setIsRegistered(!!userReg);
      }

      // Check if can generate bracket
      const isOrganizer = tournamentData.organizer_id === user?.id;
      const paidRegistrations = regsData?.length || 0;
      const hasEnoughPlayers = paidRegistrations >= 4;
      const isFull = paidRegistrations >= (tournamentData.max_participants || 0);
      const deadlinePassed = new Date(tournamentData.registration_deadline) < new Date();
      const closedManually = tournamentData.registration_closed === true;
      
      setRegistrationsClosed(closedManually || deadlinePassed || isFull);
      setCanGenerateBracket(
        isOrganizer && 
        hasEnoughPlayers && 
        (deadlinePassed || closedManually || isFull) && 
        !tournamentData.bracket_generated
      );

      // Fetch bracket matches if bracket is generated
      if (tournamentData.bracket_generated) {
        const { data: matchesData, error: matchesError } = await supabase
          .from('tournament_brackets')
          .select('*')
          .eq('tournament_id', id)
          .order('match_number');

        if (!matchesError && matchesData) {
          // Fetch player profiles for matches
          const playerIds = [
            ...matchesData.map((m: any) => m.player1_id),
            ...matchesData.map((m: any) => m.player2_id)
          ].filter(Boolean);

          if (playerIds.length > 0) {
            const { data: playersData } = await supabase
              .from('profiles')
              .select('user_id, full_name')
              .in('user_id', playerIds);

            const matchesWithPlayers = matchesData.map((match: any) => ({
              ...match,
              player1: playersData?.find((p: any) => p.user_id === match.player1_id),
              player2: playersData?.find((p: any) => p.user_id === match.player2_id)
            }));
            setBracketMatches(matchesWithPlayers);
          } else {
            setBracketMatches(matchesData);
          }
        }
      }

    } catch (error: any) {
      console.error('Error fetching tournament:', error);
      toast.error('Erro ao carregar torneio');
    } finally {
      setLoading(false);
    }
  };

  const closeRegistrations = async () => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ registration_closed: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Inscrições encerradas com sucesso!');
      fetchTournamentDetails();
    } catch (error: any) {
      console.error('Error closing registrations:', error);
      toast.error('Erro ao encerrar inscrições');
    }
  };

  const generateBracket = async () => {
    try {
      toast.loading('Gerando chaves do torneio...');
      
      // Sort registrations by ranking (seeding)
      const sortedRegistrations = [...registrations].sort((a, b) => 
        (b.profiles?.ranking_points || 0) - (a.profiles?.ranking_points || 0)
      );

      const numPlayers = sortedRegistrations.length;
      
      // Calculate total rounds needed (potência de 2 mais próxima)
      const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
      const totalRounds = Math.ceil(Math.log2(nextPowerOf2));
      
      const allMatches = [];
      
      // Generate ALL rounds at once
      for (let round = 1; round <= totalRounds; round++) {
        const matchesInRound = nextPowerOf2 / Math.pow(2, round);
        
        for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
          if (round === 1) {
            // First round: assign actual players
            const player1Index = (matchNum - 1) * 2;
            const player2Index = player1Index + 1;
            
            allMatches.push({
              tournament_id: id,
              round: `round_${round}`,
              match_number: matchNum,
              player1_id: sortedRegistrations[player1Index]?.user_id || null,
              player2_id: sortedRegistrations[player2Index]?.user_id || null,
              status: 'pending',
            });
          } else {
            // Future rounds: TBD (will be filled as winners advance)
            allMatches.push({
              tournament_id: id,
              round: `round_${round}`,
              match_number: matchNum,
              player1_id: null,
              player2_id: null,
              status: 'pending',
            });
          }
        }
      }

      // Insert ALL matches at once
      const { error } = await supabase
        .from('tournament_brackets')
        .insert(allMatches);

      if (error) throw error;

      // Auto-advance players without opponents in first round (walkovers)
      for (const match of allMatches) {
        if (match.round === 'round_1') {
          // If only one player in the match, auto-advance them
          if (match.player1_id && !match.player2_id) {
            // Auto-advance player1 to next round
            const nextMatchNum = Math.ceil(match.match_number / 2);
            const isPlayer1Pos = match.match_number % 2 === 1;
            
            await supabase
              .from('tournament_brackets')
              .update({
                [isPlayer1Pos ? 'player1_id' : 'player2_id']: match.player1_id,
                status: 'completed',
                winner_id: match.player1_id
              })
              .eq('tournament_id', id)
              .eq('round', 'round_2')
              .eq('match_number', nextMatchNum);
              
            // Mark first round match as completed (walkover)
            await supabase
              .from('tournament_brackets')
              .update({
                status: 'completed',
                winner_id: match.player1_id,
                player1_score: 'W.O.',
                player2_score: '-'
              })
              .eq('tournament_id', id)
              .eq('round', 'round_1')
              .eq('match_number', match.match_number);
          } else if (!match.player1_id && match.player2_id) {
            // Auto-advance player2 to next round
            const nextMatchNum = Math.ceil(match.match_number / 2);
            const isPlayer1Pos = match.match_number % 2 === 1;
            
            await supabase
              .from('tournament_brackets')
              .update({
                [isPlayer1Pos ? 'player1_id' : 'player2_id']: match.player2_id,
                status: 'completed',
                winner_id: match.player2_id
              })
              .eq('tournament_id', id)
              .eq('round', 'round_2')
              .eq('match_number', nextMatchNum);
              
            // Mark first round match as completed (walkover)
            await supabase
              .from('tournament_brackets')
              .update({
                status: 'completed',
                winner_id: match.player2_id,
                player1_score: '-',
                player2_score: 'W.O.'
              })
              .eq('tournament_id', id)
              .eq('round', 'round_1')
              .eq('match_number', match.match_number);
          }
        }
      }

      // Update tournament as bracket generated
      await supabase
        .from('tournaments')
        .update({ bracket_generated: true })
        .eq('id', id);

      toast.success(`Chaves geradas com sucesso! ${totalRounds} rodadas criadas (até a final).`);
      fetchTournamentDetails();
    } catch (error: any) {
      console.error('Error generating bracket:', error);
      toast.error('Erro ao gerar chaves');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando torneio...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Torneio não encontrado</h2>
            <Button onClick={() => navigate('/tournaments')}>Voltar para Torneios</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">{tournament.sport_type}</Badge>
                  <Badge variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}>
                    {tournament.status === 'upcoming' ? 'Próximo' : 'Concluído'}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {tournament.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(tournament.start_date).toLocaleDateString('pt-BR')} - {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {registrations.length} / {tournament.max_participants} inscritos
                  </div>
                  {registrationsClosed && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      Inscrições Encerradas
                    </Badge>
                  )}
                </div>
              </div>
              
              {!isRegistered && tournament.status === 'upcoming' && !registrationsClosed && (
                <TournamentPaymentButton
                  tournamentId={tournament.id}
                  tournamentName={tournament.name}
                  entryFee={tournament.entry_fee}
                  disabled={registrationsClosed}
                />
              )}
              
              {isRegistered && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Inscrito ✓
                </Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className={`grid w-full ${tournament.organizer_id === user?.id ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="registrations">Inscritos</TabsTrigger>
              <TabsTrigger value="bracket">Chaves</TabsTrigger>
              <TabsTrigger value="regulation">Regulamento</TabsTrigger>
              {tournament.organizer_id === user?.id && (
                <TabsTrigger value="management">Gestão</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Torneio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tournament.description && (
                      <p className="text-sm text-gray-600">{tournament.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Taxa de Inscrição:</span>
                        <span className="text-sm">R$ {(tournament.entry_fee / 100).toFixed(2)}</span>
                      </div>
                      {tournament.prize_pool > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Premiação:</span>
                          <span className="text-sm font-semibold text-green-600">
                            R$ {(tournament.prize_pool / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Máx. Participantes:</span>
                        <span className="text-sm">{tournament.max_participants}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Modalidades e Categorias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Modalidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {tournament.modalities?.map((mod: string) => (
                          <Badge key={mod} variant="outline">
                            {mod === 'singles' ? 'Simples' : mod === 'doubles' ? 'Duplas' : 'Por Equipes'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Categorias:</p>
                      <div className="flex flex-wrap gap-2">
                        {tournament.categories?.map((cat: string) => (
                          <Badge key={cat} variant="outline">
                            Categoria {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="registrations">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Jogadores Inscritos ({registrations.length})</CardTitle>
                    <CardDescription>Lista de jogadores com inscrição confirmada</CardDescription>
                  </div>
                  {tournament.organizer_id === user?.id && registrations.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const html2canvas = (await import('html2canvas')).default;
                          const jsPDF = (await import('jspdf')).default;

                          const element = document.getElementById('registrations-list');
                          if (!element) return;

                          const canvas = await html2canvas(element, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                          });

                          const imgData = canvas.toDataURL('image/png');
                          const pdf = new jsPDF('p', 'mm', 'a4');
                          const imgWidth = 190;
                          const imgHeight = (canvas.height * imgWidth) / canvas.width;

                          pdf.setFontSize(18);
                          pdf.text(`Lista de Inscritos - ${tournament.name}`, 10, 10);
                          pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
                          pdf.save(`inscritos-${tournament.name}.pdf`);
                          
                          toast.success('PDF baixado com sucesso!');
                        } catch (error) {
                          console.error('Erro ao gerar PDF:', error);
                          toast.error('Erro ao gerar PDF');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum jogador inscrito ainda</p>
                  ) : (
                    <div id="registrations-list" className="space-y-2">
                      {registrations.map((reg: any, index: number) => (
                        <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium">{reg.profiles?.full_name || 'Jogador'}</p>
                              <p className="text-xs text-gray-500">
                                {reg.profiles?.skill_level || 'Nível não definido'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {reg.profiles?.ranking_points || 0} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bracket">
              {canGenerateBracket && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="mb-4">As inscrições foram encerradas. Você pode gerar as chaves agora.</p>
                      <Button onClick={generateBracket}>
                        <Grid3x3 className="mr-2 h-4 w-4" />
                        Gerar Chaves do Torneio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tournament.bracket_generated && tournament.organizer_id === user?.id && (
                <div className="mb-6">
                  <TournamentMatchManager
                    tournamentId={tournament.id}
                    matches={bracketMatches}
                    onMatchUpdated={fetchTournamentDetails}
                    isOrganizer={tournament.organizer_id === user?.id}
                  />
                </div>
              )}
              
              {tournament.bracket_generated ? (
                <div>
                  {tournament.organizer_id === user?.id && (
                    <div className="flex justify-end mb-4">
                      <Button variant="outline" onClick={handleExportBracketPDF}>
                        Baixar Chave em PDF
                      </Button>
                    </div>
                  )}
                  <div id="bracket-container">
                    <TournamentBracket tournamentId={id!} />
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chaves ainda não geradas</h3>
                    <p className="text-gray-600">
                      As chaves serão geradas após o encerramento das inscrições
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="regulation">
              <Card>
                <CardHeader>
                  <CardTitle>Regulamento do Torneio</CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.regulation ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {tournament.regulation}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum regulamento cadastrado ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Gestão do Torneio
                    </CardTitle>
                    <CardDescription>
                      Área exclusiva para o organizador gerenciar o evento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Ações Rápidas */}
                      {!tournament.registration_closed && !registrationsClosed && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-yellow-900 mb-1">Inscrições Abertas</h3>
                              <p className="text-sm text-yellow-800">
                                {registrations.length} jogador(es) inscrito(s). 
                                Encerre as inscrições para gerar as chaves.
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={closeRegistrations}
                              className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                            >
                              Encerrar Inscrições
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Status do Torneio */}
                      <div>
                        <h3 className="font-semibold mb-4">Status do Torneio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Inscritos Confirmados</p>
                            <p className="text-2xl font-bold text-blue-600">{registrations.length}</p>
                            <p className="text-xs text-gray-500 mt-1">de {tournament.max_participants} vagas</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Pagamentos Confirmados</p>
                            <p className="text-2xl font-bold text-green-600">
                              {registrations.filter((r: any) => r.payment_status === 'paid').length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">inscrições pagas</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Receita Total</p>
                            <p className="text-2xl font-bold text-purple-600">
                              R$ {((tournament.entry_fee || 0) * registrations.length * 0.85).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">após taxas da plataforma</p>
                          </div>
                        </div>
                      </div>

                      {/* Ações do Organizador */}
                      <div>
                        <h3 className="font-semibold mb-4">Ações</h3>
                        <div className="space-y-3">
                          {!registrationsClosed && registrations.length >= 4 && !tournament.bracket_generated && (
                            <Button 
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('tournaments')
                                    .update({ registration_closed: true } as any)
                                    .eq('id', id);
                                  
                                  if (error) throw error;
                                  toast.success('Inscrições encerradas! Você pode gerar as chaves agora.');
                                  fetchTournamentDetails();
                                } catch (error) {
                                  toast.error('Erro ao encerrar inscrições');
                                }
                              }}
                              className="w-full"
                              variant="outline"
                            >
                              Encerrar Inscrições Antecipadamente
                            </Button>
                          )}

                          {canGenerateBracket && (
                            <Button 
                              onClick={generateBracket}
                              className="w-full bg-tennis-blue hover:bg-tennis-blue-dark"
                            >
                              <Grid3x3 className="mr-2 h-4 w-4" />
                              Gerar Chaves do Torneio
                            </Button>
                          )}
                          
                          {tournament.bracket_generated && tournament.status === 'upcoming' && (
                            <Button 
                              onClick={async () => {
                                try {
                                  toast.loading('Iniciando torneio...');
                                  const { error } = await supabase
                                    .from('tournaments')
                                    .update({ status: 'ongoing' })
                                    .eq('id', id);
                                  
                                  if (error) {
                                    console.error('Error starting tournament:', error);
                                    throw error;
                                  }
                                  toast.dismiss();
                                  toast.success('Torneio iniciado com sucesso!');
                                  fetchTournamentDetails();
                                } catch (error: any) {
                                  toast.dismiss();
                                  console.error('Error:', error);
                                  toast.error(error.message || 'Erro ao iniciar torneio');
                                }
                              }}
                              className="w-full"
                              variant="outline"
                            >
                              Iniciar Torneio
                            </Button>
                          )}
                          
                          {tournament.status === 'ongoing' && (
                            <Button 
                              onClick={async () => {
                                try {
                                  toast.loading('Finalizando torneio...');
                                  const { error } = await supabase
                                    .from('tournaments')
                                    .update({ status: 'completed' })
                                    .eq('id', id);
                                  
                                  if (error) {
                                    console.error('Error completing tournament:', error);
                                    throw error;
                                  }
                                  toast.dismiss();
                                  toast.success('Torneio finalizado com sucesso!');
                                  fetchTournamentDetails();
                                } catch (error: any) {
                                  toast.dismiss();
                                  console.error('Error:', error);
                                  toast.error(error.message || 'Erro ao finalizar torneio');
                                }
                              }}
                              className="w-full"
                              variant="outline"
                            >
                              Finalizar Torneio
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Lista de Inscrições com Status */}
                      <div>
                        <h3 className="font-semibold mb-4">Todas as Inscrições</h3>
                        <div className="space-y-2">
                          {registrations.map((reg: any, index: number) => (
                            <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                                <div>
                                  <p className="font-medium">{reg.profiles?.full_name || 'Jogador'}</p>
                                  <p className="text-xs text-gray-500">
                                    Inscrito em {new Date(reg.registration_date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={reg.payment_status === 'paid' ? 'default' : 'outline'}>
                                  {reg.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                                </Badge>
                                {reg.validated ? (
                                  <Badge variant="default" className="bg-green-600">Validado</Badge>
                                ) : (
                                  <Badge variant="outline">Não Validado</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TournamentDetails;