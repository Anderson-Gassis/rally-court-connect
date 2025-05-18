
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ChallengePlayerButton from "@/components/ChallengePlayerButton";

const NearbyPlayersSearch = () => {
  const [distance, setDistance] = useState([5]);
  const [sportType, setSportType] = useState("tennis");
  const [skillLevel, setSkillLevel] = useState("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = () => {
    setIsSearching(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setSearchResults(mockPlayers.filter(player => 
        (skillLevel === 'all' || player.level === skillLevel) &&
        player.preferredSports.includes(sportType)
      ));
      setIsSearching(false);
    }, 500);
  };
  
  // Mock data for nearby players
  const mockPlayers = [
    {
      id: '1',
      name: 'Carlos Almeida',
      nickname: 'CarlosTennis',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
      level: 'Avançado',
      region: 'São Paulo',
      distance: '1.2km',
      winRate: 87,
      preferredSports: ['tennis', 'padel'],
      headToHead: {
        wins: 2,
        losses: 1
      }
    },
    {
      id: '2',
      name: 'Ana Costa',
      nickname: 'AnaAce',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=500',
      level: 'Intermediário',
      region: 'São Paulo',
      distance: '2.5km',
      winRate: 81,
      preferredSports: ['tennis', 'beach-tennis'],
      headToHead: {
        wins: 0,
        losses: 0
      }
    },
    {
      id: '3',
      name: 'Lucas Silva',
      nickname: 'LucasSmash',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=500',
      level: 'Avançado',
      region: 'São Paulo',
      distance: '3.4km',
      winRate: 78,
      preferredSports: ['tennis', 'beach-tennis', 'padel'],
      headToHead: {
        wins: 1,
        losses: 2
      }
    },
    {
      id: '4',
      name: 'Marina Santos',
      nickname: 'MarinaSlice',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500',
      level: 'Iniciante',
      region: 'São Paulo',
      distance: '0.8km',
      winRate: 65,
      preferredSports: ['beach-tennis'],
      headToHead: {
        wins: 0,
        losses: 0
      }
    },
    {
      id: '5',
      name: 'Paulo Mendes',
      nickname: 'PauloServe',
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=500',
      level: 'Intermediário',
      region: 'São Paulo',
      distance: '1.5km',
      winRate: 72,
      preferredSports: ['padel'],
      headToHead: {
        wins: 0,
        losses: 1
      }
    },
  ];

  const sportEmoji = {
    'tennis': '🎾',
    'beach-tennis': '🏖️',
    'padel': '🏸',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Encontrar Jogadores Próximos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Sport Type */}
        <div>
          <Select value={sportType} onValueChange={setSportType}>
            <SelectTrigger>
              <SelectValue placeholder="Esporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tennis">Tênis</SelectItem>
              <SelectItem value="beach-tennis">Beach Tennis</SelectItem>
              <SelectItem value="padel">Padel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Skill Level */}
        <div>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="Iniciante">Iniciante</SelectItem>
              <SelectItem value="Intermediário">Intermediário</SelectItem>
              <SelectItem value="Avançado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search Button */}
        <div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-tennis-blue hover:bg-tennis-blue-dark"
          >
            {isSearching ? (
              "Buscando..."
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Distance Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Distância máxima</label>
          <span className="text-sm text-gray-500">{distance} km</span>
        </div>
        <Slider
          defaultValue={distance}
          max={30}
          step={1}
          onValueChange={setDistance}
        />
      </div>
      
      {/* Results */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800">
          {searchResults.length > 0 
            ? `${searchResults.length} jogadores encontrados` 
            : searchResults.length === 0 && isSearching === false 
              ? "Busque jogadores próximos" 
              : "Buscando..."}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map(player => (
            <Card key={player.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={player.image} alt={player.name} />
                      <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{player.name}</h4>
                      <div className="text-sm text-gray-500">{player.nickname}</div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{player.distance}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="bg-tennis-blue mb-1">{player.level}</Badge>
                    <div className="text-xs text-gray-600 mt-1">
                      {player.preferredSports.map((sport: string) => (
                        <span key={sport} className="mr-1" title={sport}>
                          {sportEmoji[sport as keyof typeof sportEmoji]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-600">Taxa de Vitória: <span className="font-medium">{player.winRate}%</span></div>
                    <div className="text-xs text-gray-600 mt-1">
                      Head to Head: <span className="font-medium text-green-600">{player.headToHead.wins}</span> - <span className="font-medium text-red-600">{player.headToHead.losses}</span>
                    </div>
                  </div>
                  <ChallengePlayerButton playerId={player.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyPlayersSearch;
