import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TournamentBracketPDFProps {
  tournamentName: string;
  matches: any[];
}

const TournamentBracketPDF = ({ tournamentName, matches }: TournamentBracketPDFProps) => {
  const bracketRef = useRef<HTMLDivElement>(null);

  const getRoundName = (roundNum: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundNum + 1;
    if (roundsFromEnd === 1) return 'Final';
    if (roundsFromEnd === 2) return 'Semifinal';
    if (roundsFromEnd === 3) return 'Quartas';
    if (roundsFromEnd === 4) return 'Oitavas';
    return `Rodada ${roundNum}`;
  };

  const getMatchesByRound = () => {
    const rounds = new Map<string, any[]>();
    matches.forEach(match => {
      if (!rounds.has(match.round)) {
        rounds.set(match.round, []);
      }
      rounds.get(match.round)?.push(match);
    });
    return Array.from(rounds.entries()).sort((a, b) => {
      const numA = parseInt(a[0].split('_')[1]);
      const numB = parseInt(b[0].split('_')[1]);
      return numA - numB;
    });
  };

  const generatePDF = async () => {
    if (!bracketRef.current) return;

    try {
      toast.loading('Gerando PDF...');
      
      const canvas = await html2canvas(bracketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > 210 ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${tournamentName}-chave.pdf`);
      
      toast.dismiss();
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Erro ao gerar PDF');
    }
  };

  const roundsData = getMatchesByRound();
  const totalRounds = roundsData.length;

  return (
    <div className="space-y-4">
      <Button onClick={generatePDF} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF da Chave
      </Button>

      <Card>
        <CardContent className="p-6">
          <div ref={bracketRef} className="bg-white p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{tournamentName}</h2>
              <p className="text-sm text-gray-600 mt-1">Chave do Torneio</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {roundsData.map(([roundKey, roundMatches], roundIndex) => {
                const roundNum = parseInt(roundKey.split('_')[1]);
                const isLastRound = roundIndex === totalRounds - 1;
                
                return (
                  <div key={roundKey} className="flex-shrink-0" style={{ minWidth: '220px' }}>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {getRoundName(roundNum, totalRounds)}
                      </h3>
                    </div>

                    <div 
                      className="space-y-4"
                      style={{ 
                        paddingTop: `${roundIndex * 40}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        minHeight: `${Math.max(roundMatches.length * 120, 400)}px`
                      }}
                    >
                      {roundMatches.map((match: any) => (
                        <div
                          key={match.id}
                          className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-sm"
                        >
                          <div className="text-xs text-gray-500 mb-2 font-medium">
                            Partida #{match.match_number}
                          </div>

                          <div className={`flex items-center justify-between p-2 rounded mb-1 ${
                            match.winner_id === match.player1_id 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-gray-50'
                          }`}>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.player1?.full_name || 'Aguardando...'}
                            </span>
                            {match.player1_score && (
                              <span className="ml-2 font-bold text-gray-900">{match.player1_score}</span>
                            )}
                          </div>

                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner_id === match.player2_id 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-gray-50'
                          }`}>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.player2?.full_name || 'Aguardando...'}
                            </span>
                            {match.player2_score && (
                              <span className="ml-2 font-bold text-gray-900">{match.player2_score}</span>
                            )}
                          </div>

                          {match.winner_id && (
                            <div className="mt-2 text-center">
                              <Trophy className="h-3 w-3 text-yellow-600 inline mr-1" />
                              <span className="text-xs text-green-700 font-semibold">
                                {match.winner?.full_name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!isLastRound && (
                      <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400">
                        <svg width="20" height="100%" viewBox="0 0 20 100" preserveAspectRatio="none">
                          <line x1="0" y1="25" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
                          <line x1="0" y1="75" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentBracketPDF;
