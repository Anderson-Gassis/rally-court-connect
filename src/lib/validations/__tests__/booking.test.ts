import { describe, it, expect } from 'vitest';
import { bookingSchema } from '../booking';

describe('Booking Schema Validation', () => {
  it('should accept valid booking data', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(true);
  });

  it('should reject booking with invalid court ID', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: 'invalid-uuid',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(false);
  });

  it('should reject booking with end time before start time', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: tomorrow,
      startTime: '15:00',
      endTime: '14:00',
    });
    expect(result.success).toBe(false);
  });

  it('should reject booking with invalid time format', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: tomorrow,
      startTime: '25:00',
      endTime: '26:00',
    });
    expect(result.success).toBe(false);
  });

  it('should reject past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: yesterday,
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.success).toBe(false);
  });

  it('should reject bookings shorter than 30 minutes', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:15',
    });
    expect(result.success).toBe(false);
  });

  it('should reject bookings longer than 12 hours', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = bookingSchema.safeParse({
      courtId: '123e4567-e89b-12d3-a456-426614174000',
      date: tomorrow,
      startTime: '08:00',
      endTime: '21:00',
    });
    expect(result.success).toBe(false);
  });
});
