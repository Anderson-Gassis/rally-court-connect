import { useQuery } from '@tanstack/react-query';
import { playersService, Player, PlayerFilters } from '@/services/playersService';

export const usePlayers = (filters?: PlayerFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['players', filters],
    queryFn: () => playersService.getNearbyPlayers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled, // Allow external control of when to run
    retry: (failureCount, error) => {
      console.error('Players query error:', error);
      return failureCount < 2; // Only retry twice
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

export const usePlayerSearch = () => {
  return useQuery({
    queryKey: ['player-search'],
    queryFn: () => playersService.getNearbyPlayers(),
    enabled: false, // Only run when manually triggered
  });
};