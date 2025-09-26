import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { courtsService, Court, CourtFilters } from '@/services/courtsService';

export const useCourts = (filters?: CourtFilters) => {
  return useQuery({
    queryKey: ['courts', filters],
    queryFn: () => courtsService.getCourts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCourt = (id: string) => {
  return useQuery({
    queryKey: ['court', id],
    queryFn: () => courtsService.getCourtById(id),
    enabled: !!id,
  });
};

export const useCourtSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CourtFilters>({});
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: courts, isLoading, error } = useQuery({
    queryKey: ['court-search', debouncedSearchTerm, filters],
    queryFn: () => courtsService.searchCourts(debouncedSearchTerm, filters),
    enabled: debouncedSearchTerm.length > 0 || Object.keys(filters).length > 0,
  });

  return {
    courts: courts || [],
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
  };
};