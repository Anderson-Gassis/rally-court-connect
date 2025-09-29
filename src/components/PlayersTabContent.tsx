import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, MapPin, Clock } from 'lucide-react';
import PlayersSearchContainer from '@/components/PlayersSearchContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const PlayersTabContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Encontre Jogadores</h1>
              <p className="text-gray-600">
                Conecte-se com jogadores próximos e desafie para partidas emocionantes
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button asChild variant="outline">
                <Link to="/courts">
                  <MapPin className="h-4 w-4 mr-2" />
                  Encontrar Quadras
                </Link>
              </Button>
              <Button asChild className="bg-tennis-blue hover:bg-tennis-blue-dark">
                <Link to="/tournaments">
                  <Trophy className="h-4 w-4 mr-2" />
                  Torneios
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Jogadores Ativos</CardTitle>
                  <Users className="h-4 w-4 text-tennis-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <p className="text-xs text-green-600 mt-1">+12% esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Partidas Hoje</CardTitle>
                  <Trophy className="h-4 w-4 text-tennis-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">68</div>
                <p className="text-xs text-green-600 mt-1">+5% vs ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-tennis-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">1h 30min</div>
                <p className="text-xs text-gray-500 mt-1">duração das partidas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
          <ErrorBoundary>
            <PlayersSearchContainer />
          </ErrorBoundary>
      </div>
    </div>
  );
};

export default PlayersTabContent;