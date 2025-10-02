import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CourtRating from '../CourtRating';

describe('CourtRating Component', () => {
  it('should render rating with stars', () => {
    const { container } = render(<CourtRating rating={4.5} reviewCount={10} />);
    
    expect(container.textContent).toContain('4.5');
    expect(container.textContent).toContain('(10 avaliações)');
  });

  it('should show "Sem avaliações" when rating is 0', () => {
    const { container } = render(<CourtRating rating={0} reviewCount={0} />);
    
    expect(container.textContent).toContain('Sem avaliações');
  });

  it('should hide review count when showCount is false', () => {
    const { container } = render(<CourtRating rating={4.5} reviewCount={10} showCount={false} />);
    
    expect(container.textContent).toContain('4.5');
    expect(container.textContent).not.toContain('(10 avaliações)');
  });

  it('should render with correct size classes', () => {
    const { container, rerender } = render(<CourtRating rating={4.5} size="sm" />);
    expect(container.querySelector('.text-xs')).toBeTruthy();

    rerender(<CourtRating rating={4.5} size="md" />);
    expect(container.querySelector('.text-sm')).toBeTruthy();

    rerender(<CourtRating rating={4.5} size="lg" />);
    expect(container.querySelector('.text-base')).toBeTruthy();
  });

  it('should handle singular/plural review count correctly', () => {
    const { container, rerender } = render(<CourtRating rating={4.5} reviewCount={1} />);
    expect(container.textContent).toContain('(1 avaliação)');

    rerender(<CourtRating rating={4.5} reviewCount={2} />);
    expect(container.textContent).toContain('(2 avaliações)');
  });
});
