import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Trophy, Check, X, Flag } from 'lucide-react';
import { Challenge } from '@/services/challengesService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChallengesCardProps {
  challenges: Challenge[];
  currentUserId: string;
  onAccept: (challengeId: string) => void;
  onDecline: (challengeId: string) => void;
  onReportResult: (challengeId: string) => void;
  loading?: boolean;
}

export const ChallengesCard = ({ 
  challenges, 
  currentUserId, 
  onAccept, 
  onDecline,
  onReportResult,
  loading 
}: ChallengesCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Aceito</Badge>;
      case 'declined':
        return <Badge variant="destructive">Recusado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'friendly': '🎾 Amistoso',
      'singles': '👤 Individual',
      'doubles': '👥 Duplas',
      'ranking': '🏆 Rankeado'
    };
    return types[type] || type;
  };

  const isPastDate = (date: string) => {
    return new Date(date) < new Date();
  };

  const receivedChallenges = challenges.filter(c => c.challenged_id === currentUserId && c.status === 'pending');
  const acceptedChallenges = challenges.filter(c => c.status === 'accepted' && !isPastDate(c.preferred_date));
  const sentChallenges = challenges.filter(c => c.challenger_id === currentUserId && c.status === 'pending');
  const completedChallenges = challenges.filter(c => c.status === 'accepted' && isPastDate(c.preferred_date));

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Convites Recebidos */}
      {receivedChallenges.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Trophy className="h-5 w-5" />
              Convites Recebidos
            </CardTitle>
            <CardDescription>
              Você tem {receivedChallenges.length} convite(s) aguardando resposta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivedChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-start justify-between p-4 bg-white border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback>
                          {challenge.challenger_profile?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{challenge.challenger_profile?.full_name || 'Jogador'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getChallengeTypeLabel(challenge.challenge_type)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(challenge.preferred_date).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {challenge.message && (
                      <p className="text-sm text-gray-500 italic">"{challenge.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onAccept(challenge.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDecline(challenge.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Jogos Confirmados */}
      {acceptedChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Próximos Jogos Confirmados
            </CardTitle>
            <CardDescription>
              Seus jogos agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedChallenges.map((challenge) => {
                const isChallenger = challenge.challenger_id === currentUserId;
                const opponentProfile = isChallenger ? challenge.challenged_profile : challenge.challenger_profile;
                
                return (
                  <div key={challenge.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarFallback>
                            {opponentProfile?.full_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">vs {opponentProfile?.full_name || 'Jogador'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getChallengeTypeLabel(challenge.challenge_type)}
                          </p>
                        </div>
                        {getStatusBadge(challenge.status)}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(challenge.preferred_date).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convites Enviados */}
      {sentChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Convites Enviados
            </CardTitle>
            <CardDescription>
              Aguardando resposta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback>
                          {challenge.challenged_profile?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{challenge.challenged_profile?.full_name || 'Jogador'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getChallengeTypeLabel(challenge.challenge_type)}
                        </p>
                      </div>
                      {getStatusBadge(challenge.status)}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(challenge.preferred_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jogos para Reportar Resultado */}
      {completedChallenges.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Flag className="h-5 w-5" />
              Reportar Resultado
            </CardTitle>
            <CardDescription>
              Jogos realizados aguardando resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedChallenges.map((challenge) => {
                const isChallenger = challenge.challenger_id === currentUserId;
                const opponentProfile = isChallenger ? challenge.challenged_profile : challenge.challenger_profile;
                
                return (
                  <div key={challenge.id} className="flex items-start justify-between p-4 bg-white border border-blue-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarFallback>
                            {opponentProfile?.full_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">vs {opponentProfile?.full_name || 'Jogador'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getChallengeTypeLabel(challenge.challenge_type)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(challenge.preferred_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onReportResult(challenge.id)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Reportar Resultado
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {receivedChallenges.length === 0 && 
       acceptedChallenges.length === 0 && 
       sentChallenges.length === 0 && 
       completedChallenges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum jogo agendado
            </h3>
            <p className="text-gray-600 mb-6">
              Que tal convidar alguém para jogar?
            </p>
            <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
              <a href="/players">
                <Trophy className="h-4 w-4 mr-2" />
                Encontrar Jogadores
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
