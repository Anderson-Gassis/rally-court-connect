import { useQuery } from '@tanstack/react-query';
import { instructorsService, InstructorFilters } from '@/services/instructorsService';

export const useInstructors = (filters?: InstructorFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['instructors', filters],
    queryFn: () => instructorsService.getNearbyInstructors(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled,
    retry: (failureCount, error) => {
      console.error('Instructors query error:', error);
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};
