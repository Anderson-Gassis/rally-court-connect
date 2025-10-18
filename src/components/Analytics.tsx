import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const Analytics = () => {
  useEffect(() => {
    // Initialize Google Analytics if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      // Track page view
      window.gtag('config', 'G-63DEP8ZKQ1', {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;

// Utility functions for tracking events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackBooking = (courtId: string, price: number) => {
  trackEvent('booking_initiated', {
    court_id: courtId,
    value: price,
    currency: 'BRL'
  });
};

export const trackTournamentRegistration = (tournamentId: string, entryFee: number) => {
  trackEvent('tournament_registration', {
    tournament_id: tournamentId,
    value: entryFee,
    currency: 'BRL'
  });
};

export const trackSearch = (searchTerm: string, location?: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    location: location
  });
};