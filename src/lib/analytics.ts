// Simple analytics tracking for MVP
// Can be replaced with Google Analytics, Mixpanel, etc.

type EventData = Record<string, any>;

interface AnalyticsEvent {
  name: string;
  data?: EventData;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 100;

  track(eventName: string, data?: EventData) {
    const event: AnalyticsEvent = {
      name: eventName,
      data,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, data);
    }

    // TODO: Send to analytics service in production
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Common events
export const trackPageView = (pageName: string) => {
  analytics.track('page_view', { page: pageName });
};

export const trackBookingStarted = (courtId: string, courtName: string) => {
  analytics.track('booking_started', { courtId, courtName });
};

export const trackBookingCompleted = (courtId: string, amount: number) => {
  analytics.track('booking_completed', { courtId, amount });
};

export const trackChallengeCreated = (challengeType: string) => {
  analytics.track('challenge_created', { challengeType });
};

export const trackSearch = (searchTerm: string, filters?: any) => {
  analytics.track('search', { searchTerm, filters });
};

export const trackError = (error: string, context?: any) => {
  analytics.track('error', { error, context });
};
