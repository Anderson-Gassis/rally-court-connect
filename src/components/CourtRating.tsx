import { Star } from 'lucide-react';

interface CourtRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const CourtRating = ({ 
  rating, 
  reviewCount = 0, 
  size = 'md',
  showCount = true 
}: CourtRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (rating === 0 && reviewCount === 0) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${textSizeClasses[size]}`}>
        <Star className={sizeClasses[size]} />
        <span>Sem avaliações</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${textSizeClasses[size]}`}>
      <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      <span className="font-medium">{rating.toFixed(1)}</span>
      {showCount && reviewCount > 0 && (
        <span className="text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
        </span>
      )}
    </div>
  );
};

export default CourtRating;
