
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Search, MapPin, Calendar as CalendarIcon, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourtFilters } from '@/services/courtsService';

interface CourtSearchProps {
  onSearch?: (location: string, filters: CourtFilters) => void;
}

const CourtSearch = ({ onSearch }: CourtSearchProps) => {
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState([5]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sportType, setSportType] = useState("all");
  const [filters, setFilters] = useState({
    saibro: false,
    rapida: false,
    grama: false,
    coberta: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSearch = () => {
    const searchFilters: CourtFilters = {
      location: location || undefined,
      sport_type: sportType !== "all" ? sportType : undefined,
      max_distance: distance[0],
    };
    onSearch?.(location, searchFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-5xl mx-auto -mt-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Location */}
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Onde você quer jogar?"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Sport Type Selector */}
        <div className="md:col-span-2">
          <Select value={sportType} onValueChange={setSportType}>
            <SelectTrigger>
              <SelectValue placeholder="Esporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="tennis">Tênis</SelectItem>
              <SelectItem value="beach-tennis">Beach Tennis</SelectItem>
              <SelectItem value="padel">Padel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Selector */}
        <div className="md:col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-gray-200"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString()
                ) : (
                  <span className="text-gray-500">Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selector */}
        <div className="md:col-span-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Manhã (6h - 12h)</SelectItem>
              <SelectItem value="afternoon">Tarde (12h - 18h)</SelectItem>
              <SelectItem value="evening">Noite (18h - 23h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <Button 
            className="w-full bg-tennis-blue hover:bg-tennis-blue-dark"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Advanced Filters Button */}
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-tennis-blue-dark"
          onClick={toggleFilters}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtros {showFilters ? "▲" : "▼"}
        </Button>

        <div className="mt-2 text-sm font-medium text-gray-700">
          Distância: {distance} km
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distance Slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Distância máxima (km)</label>
            <Slider
              defaultValue={distance}
              max={30}
              step={1}
              onValueChange={setDistance}
              className="py-4"
            />
          </div>

          {/* Court Types - Changes based on selected sport */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Tipo de Quadra</label>
            <div className="grid grid-cols-2 gap-2">
              {sportType === "all" || sportType === "tennis" ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saibro"
                      checked={filters.saibro}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, saibro: !!checked })
                      }
                    />
                    <label
                      htmlFor="saibro"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Saibro
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rapida"
                      checked={filters.rapida}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, rapida: !!checked })
                      }
                    />
                    <label
                      htmlFor="rapida"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Rápida
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grama"
                      checked={filters.grama}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, grama: !!checked })
                      }
                    />
                    <label
                      htmlFor="grama"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Grama
                    </label>
                  </div>
                </>
              ) : null}
              
              {sportType === "beach-tennis" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="areia" />
                    <label
                      htmlFor="areia"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Areia
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="artificial" />
                    <label
                      htmlFor="artificial"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Areia Artificial
                    </label>
                  </div>
                </>
              )}
              
              {sportType === "padel" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="vidro" />
                    <label
                      htmlFor="vidro"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Vidro
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="muro" />
                    <label
                      htmlFor="muro"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Muro
                    </label>
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coberta"
                  checked={filters.coberta}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, coberta: !!checked })
                  }
                />
                <label
                  htmlFor="coberta"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Coberta
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtSearch;
