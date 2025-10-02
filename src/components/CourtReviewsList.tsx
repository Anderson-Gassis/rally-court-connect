import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { reviewsService, CourtReview } from '@/services/reviewsService';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CourtReviewsListProps {
  courtId: string;
  onReviewsChange?: () => void;
}

const CourtReviewsList = ({ courtId, onReviewsChange }: CourtReviewsListProps) => {
  const [reviews, setReviews] = useState<CourtReview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchCurrentUser();
  }, [courtId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewsService.getCourtReviews(courtId);
      setReviews(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReviewId) return;

    try {
      await reviewsService.deleteReview(deleteReviewId);
      toast({
        title: 'Avaliação excluída',
        description: 'Sua avaliação foi removida com sucesso',
      });
      fetchReviews();
      onReviewsChange?.();
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a avaliação',
        variant: 'destructive',
      });
    } finally {
      setDeleteReviewId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Ainda não há avaliações para esta quadra.</p>
        <p className="text-sm mt-1">Seja o primeiro a avaliar!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {review.user?.full_name || 'Usuário'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {currentUserId === review.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteReviewId(review.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourtReviewsList;
