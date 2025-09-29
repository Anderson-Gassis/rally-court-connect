import { useQuery } from '@tanstack/react-query';
import { playersService, Player, PlayerFilters } from '@/services/playersService';

export const usePlayers = (filters?: PlayerFilters) => {
  return useQuery({
    queryKey: ['players', filters],
    queryFn: () => playersService.getNearbyPlayers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!filters, // Only run if filters are provided
  });
};

export const usePlayerSearch = () => {
  return useQuery({
    queryKey: ['player-search'],
    queryFn: () => playersService.getNearbyPlayers(),
    enabled: false, // Only run when manually triggered
  });
};