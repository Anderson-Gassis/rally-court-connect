import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewsService } from '@/services/reviewsService';

interface CourtReviewFormProps {
  courtId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onSuccess: () => void;
}

const CourtReviewForm = ({ courtId, existingReview, onSuccess }: CourtReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Avaliação obrigatória',
        description: 'Por favor, selecione uma avaliação de 1 a 5 estrelas',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await reviewsService.updateReview(existingReview.id, rating, comment);
        toast({
          title: 'Avaliação atualizada',
          description: 'Sua avaliação foi atualizada com sucesso!',
        });
      } else {
        await reviewsService.createReview({
          court_id: courtId,
          rating,
          comment: comment.trim() || undefined,
        });
        toast({
          title: 'Avaliação enviada',
          description: 'Obrigado pela sua avaliação!',
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          {existingReview ? 'Atualizar sua avaliação' : 'Avaliar quadra'}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium mb-2 block">
          Comentário (opcional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência sobre a quadra..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 caracteres
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? 'Enviando...'
          : existingReview
          ? 'Atualizar Avaliação'
          : 'Enviar Avaliação'}
      </Button>
    </form>
  );
};

export default CourtReviewForm;
