import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Search, Users, Award, Star, Calendar, DollarSign } from 'lucide-react';
import { Instructor, instructorsService, InstructorFilters } from '@/services/instructorsService';
import SafeLoading from '@/components/SafeLoading';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const InstructorsSearchContainer = () => {
  const [distance, setDistance] = useState([50]);
  const [specialization, setSpecialization] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  const searchInstructors = useCallback(async () => {
    console.log('Iniciando busca de instrutores...', { distance: distance[0], specialization, maxPrice });
    setLoading(true);
    setError(null);

    try {
      const filters: InstructorFilters = {
        distance: distance[0],
        ...(specialization && specialization !== 'all' && { specialization }),
        maxPrice,
        ...(trialAvailable && { trialAvailable: true })
      };

      console.log('Chamando instructorsService com filtros:', filters);
      const results = await instructorsService.getNearbyInstructors(filters);
      console.log('Resultados da busca:', results);
      setInstructors(results);
    } catch (err) {
      console.error('Erro ao buscar instrutores:', err);
      setError('Erro ao buscar professores. Tente novamente.');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [distance, specialization, maxPrice, trialAvailable]);

  const getInstructorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Busca inicial ao montar o componente
  useEffect(() => {
    searchInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professores de Tênis</h2>
        <p className="text-gray-600">
          Encontre professores qualificados na sua região e agende sua aula
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger>
              <SelectValue placeholder="Especialização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especializações</SelectItem>
              <SelectItem value="Iniciante">Iniciante</SelectItem>
              <SelectItem value="Crianças">Crianças</SelectItem>
              <SelectItem value="Mulheres">Mulheres</SelectItem>
              <SelectItem value="Profissional">Profissional</SelectItem>
              <SelectItem value="Competição">Competição</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="trial"
            checked={trialAvailable}
            onChange={(e) => setTrialAvailable(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="trial" className="text-sm">Aula Experimental</label>
        </div>

        <Button 
          onClick={searchInstructors}
          disabled={loading}
          className="bg-tennis-blue hover:bg-tennis-blue-dark text-white"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {/* Slider de Distância */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Distância máxima
          </label>
          <span className="text-sm text-tennis-blue font-medium">
            {distance[0]} km
          </span>
        </div>
        <Slider
          value={distance}
          onValueChange={setDistance}
          max={100}
          min={5}
          step={5}
          className="w-full"
        />
      </div>

      {/* Slider de Preço */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Preço máximo por hora
          </label>
          <span className="text-sm text-tennis-blue font-medium">
            R$ {maxPrice}
          </span>
        </div>
        <Slider
          value={[maxPrice]}
          onValueChange={(value) => setMaxPrice(value[0])}
          max={500}
          min={50}
          step={10}
          className="w-full"
        />
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Erro ao carregar professores
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={searchInstructors}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : loading ? (
          <SafeLoading message="Buscando professores..." />
        ) : instructors.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {instructors.length} professor{instructors.length !== 1 ? 'es' : ''} encontrado{instructors.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor) => (
                <Card key={instructor.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center mb-4">
                      <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={instructor.avatar_url} />
                        <AvatarFallback className="bg-tennis-blue text-white text-xl font-semibold">
                          {getInstructorInitials(instructor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {instructor.full_name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center justify-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {instructor.location || 'Localização não informada'}
                          {instructor.distance && (
                            <span className="ml-2 text-tennis-blue font-medium">
                              • {instructor.distance.toFixed(1)}km
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {instructor.specialization && instructor.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {instructor.specialization.slice(0, 3).map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {instructor.bio && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {instructor.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1 text-tennis-blue" />
                          {instructor.experience_years || 0} anos
                        </div>
                        <div className="flex items-center font-semibold text-tennis-blue">
                          <DollarSign className="h-4 w-4" />
                          {instructor.hourly_rate}/h
                        </div>
                      </div>

                      {instructor.trial_class_available && (
                        <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-200">
                          Aula Experimental Disponível
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        asChild
                        variant="outline"
                        className="w-full border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10"
                      >
                        <Link to={`/instructors/${instructor.user_id}`}>
                          Ver Perfil
                        </Link>
                      </Button>
                      <Button 
                        asChild
                        className="w-full bg-tennis-blue hover:bg-tennis-blue-dark text-white"
                      >
                        <Link to={`/instructors/${instructor.user_id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar Aula
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum professor encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou aumentar a distância de busca.
            </p>
            <Button 
              onClick={searchInstructors}
              variant="outline"
              className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue/10"
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorsSearchContainer;