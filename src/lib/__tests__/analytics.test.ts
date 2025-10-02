import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics, trackPageView, trackBookingStarted, trackBookingCompleted } from '../analytics';

describe('Analytics', () => {
  beforeEach(() => {
    analytics.clearEvents();
    vi.clearAllMocks();
  });

  it('should track events', () => {
    analytics.track('test_event', { key: 'value' });
    
    const events = analytics.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('test_event');
    expect(events[0].data).toEqual({ key: 'value' });
  });

  it('should track multiple events', () => {
    analytics.track('event1');
    analytics.track('event2');
    analytics.track('event3');
    
    const events = analytics.getEvents();
    expect(events).toHaveLength(3);
  });

  it('should limit stored events to maxEvents', () => {
    // Track 150 events (max is 100)
    for (let i = 0; i < 150; i++) {
      analytics.track(`event_${i}`);
    }
    
    const events = analytics.getEvents();
    expect(events).toHaveLength(100);
    // Should keep the most recent 100 events
    expect(events[0].name).toBe('event_50');
    expect(events[99].name).toBe('event_149');
  });

  it('should clear all events', () => {
    analytics.track('event1');
    analytics.track('event2');
    expect(analytics.getEvents()).toHaveLength(2);
    
    analytics.clearEvents();
    expect(analytics.getEvents()).toHaveLength(0);
  });

  it('should track page views', () => {
    trackPageView('home');
    
    const events = analytics.getEvents();
    expect(events[0].name).toBe('page_view');
    expect(events[0].data).toEqual({ page: 'home' });
  });

  it('should track booking started', () => {
    trackBookingStarted('court-123', 'Tennis Court A');
    
    const events = analytics.getEvents();
    expect(events[0].name).toBe('booking_started');
    expect(events[0].data).toEqual({ 
      courtId: 'court-123', 
      courtName: 'Tennis Court A' 
    });
  });

  it('should track booking completed', () => {
    trackBookingCompleted('court-123', 100);
    
    const events = analytics.getEvents();
    expect(events[0].name).toBe('booking_completed');
    expect(events[0].data).toEqual({ 
      courtId: 'court-123', 
      amount: 100 
    });
  });

  it('should include timestamps in events', () => {
    const beforeTime = Date.now();
    analytics.track('test_event');
    const afterTime = Date.now();
    
    const events = analytics.getEvents();
    expect(events[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(events[0].timestamp).toBeLessThanOrEqual(afterTime);
  });
});
