import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '../auth';

describe('Login Schema Validation', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'validpass123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'validpass123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from email', () => {
    const result = loginSchema.safeParse({
      email: '  user@example.com  ',
      password: 'validpass123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });
});

describe('Register Schema Validation', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'validpass123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject name that is too short', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'user@example.com',
      password: 'validpass123',
    });
    expect(result.success).toBe(false);
  });

  it('should require letters in password', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'user@example.com',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('should require numbers in password', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'onlyletters',
    });
    expect(result.success).toBe(false);
  });
});

describe('Reset Password Schema Validation', () => {
  it('should accept valid email for password reset', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
