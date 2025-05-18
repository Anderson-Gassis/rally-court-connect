
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourtCardProps {
  id: string;
  name: string;
  type: string; // 'saibro', 'rápida', 'grama', etc.
  image: string;
  location: string;
  distance: string; // e.g. '3.2km'
  rating: number;
  price: number; // price per hour
  available: boolean;
  features?: string[];
}

const CourtCard = ({
  id,
  name,
  type,
  image,
  location,
  distance,
  rating,
  price,
  available,
  features = []
}: CourtCardProps) => {
  
  const typeColor = {
    'saibro': 'bg-tennis-orange',
    'rápida': 'bg-tennis-blue',
    'grama': 'bg-tennis-green',
    'indoor': 'bg-tennis-blue-dark',
  } as Record<string, string>;
  
  const typeClass = typeColor[type.toLowerCase()] || 'bg-gray-500';
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {available && (
          <Badge 
            className="absolute top-3 left-3 bg-green-500 text-white hover:bg-green-600"
          >
            Disponível Agora
          </Badge>
        )}
        <div className={`absolute top-3 right-3 ${typeClass} text-white px-3 py-1 rounded-full text-xs font-medium`}>
          {type}
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current stroke-yellow-500" />
            <span className="ml-1 text-sm font-medium text-gray-900">{rating}</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
          <span className="mx-1">•</span>
          <span>{distance}</span>
        </div>
        
        {features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {features.map((feature, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-tennis-blue-dark font-semibold">R${price}/hora</span>
        </div>
        <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white">
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourtCard;
