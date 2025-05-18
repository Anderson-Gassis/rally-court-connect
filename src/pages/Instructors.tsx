
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar } from "lucide-react";

const Instructors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  
  // Mock data for instructors
  const instructors = [
    {
      id: '1',
      name: 'André Oliveira',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
      location: 'São Paulo, SP',
      locations: ['Clube Atlético Paulistano', 'Tennis Park'],
      specialization: ['Adultos', 'Avançado', 'Competição'],
      experience: 12,
      rating: 4.9,
      reviewCount: 45,
      bio: 'Ex-tenista profissional com mais de 12 anos de experiência em treinamento de alto rendimento. Especialista em desenvolvimento técnico para jogadores avançados.',
      hourlyRate: 200
    },
    {
      id: '2',
      name: 'Carolina Mendes',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=500',
      location: 'São Paulo, SP',
      locations: ['Academia Ace', 'Condomínio Green Park'],
      specialization: ['Crianças', 'Iniciante', 'Intermediário'],
      experience: 8,
      rating: 4.8,
      reviewCount: 37,
      bio: 'Formada em Educação Física com especialização em treinamento de tênis para crianças. Abordagem lúdica e técnica para iniciantes.',
      hourlyRate: 150
    },
    {
      id: '3',
      name: 'Ricardo Santos',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=500',
      location: 'Rio de Janeiro, RJ',
      locations: ['Clube Fluminense'],
      specialization: ['Adultos', 'Seniors', 'Intermediário'],
      experience: 15,
      rating: 4.7,
      reviewCount: 52,
      bio: 'Especialista em biomecânica do tênis com foco em técnicas para prevenir lesões. Experiência em reabilitação de tenistas com histórico de lesões.',
      hourlyRate: 180
    },
    {
      id: '4',
      name: 'Paula Costa',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500',
      location: 'São Paulo, SP',
      locations: ['Tennis Park', 'Centro Esportivo Ibirapuera'],
      specialization: ['Jovens', 'Competição', 'Mental Training'],
      experience: 10,
      rating: 4.9,
      reviewCount: 41,
      bio: 'Ex-jogadora profissional com foco em treinamento mental e preparação para competições. Treinadora de jovens promessas do tênis brasileiro.',
      hourlyRate: 220
    },
    {
      id: '5',
      name: 'Marcelo Lima',
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=500',
      location: 'Curitiba, PR',
      locations: ['Clube Curitibano'],
      specialization: ['Todos os níveis', 'Técnica', 'Condicionamento'],
      experience: 7,
      rating: 4.6,
      reviewCount: 28,
      bio: 'Treinador com abordagem integrada de técnica, tática e condicionamento físico. Planos de treinamento personalizados para cada aluno.',
      hourlyRate: 160
    },
    {
      id: '6',
      name: 'Julia Ferreira',
      image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=500',
      location: 'Belo Horizonte, MG',
      locations: ['Minas Tênis Clube'],
      specialization: ['Crianças', 'Iniciante', 'Duplas'],
      experience: 5,
      rating: 4.8,
      reviewCount: 19,
      bio: 'Especialista em ensino de tênis para crianças e iniciantes. Metodologia divertida e eficaz para aprendizado rápido dos fundamentos.',
      hourlyRate: 140
    }
  ];
  
  // Filter instructors based on search and filters
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || instructor.location.includes(locationFilter);
    const matchesSpecialization = specializationFilter === 'all' || 
                                 instructor.specialization.includes(specializationFilter);
    
    return matchesSearch && matchesLocation && matchesSpecialization;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Encontre Professores de Tênis</h1>
          
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar professores..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
                <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por especialização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as especializações</SelectItem>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
                <SelectItem value="Competição">Competição</SelectItem>
                <SelectItem value="Crianças">Crianças</SelectItem>
                <SelectItem value="Jovens">Jovens</SelectItem>
                <SelectItem value="Adultos">Adultos</SelectItem>
                <SelectItem value="Seniors">Seniors</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <Avatar className="h-16 w-16 border-2 border-tennis-blue">
                    <AvatarImage src={instructor.image} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{instructor.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {instructor.location}
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 font-medium">{instructor.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({instructor.reviewCount} avaliações)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 mb-1">Especialização:</div>
                    <div className="flex flex-wrap gap-1">
                      {instructor.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <CardDescription className="line-clamp-3">
                      {instructor.bio}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">R$ {instructor.hourlyRate}/hora</span>
                    <span>{instructor.experience} anos de experiência</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex justify-between pt-4">
                  <Link to={`/instructors/${instructor.id}`} className="text-tennis-blue hover:underline">
                    Ver Perfil
                  </Link>
                  <Button className="bg-tennis-blue hover:bg-tennis-blue-dark">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Aula
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Instructors;
