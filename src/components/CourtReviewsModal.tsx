import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourtReviewForm from './CourtReviewForm';
import CourtReviewsList from './CourtReviewsList';
import CourtRating from './CourtRating';
import { reviewsService } from '@/services/reviewsService';
import { supabase } from '@/integrations/supabase/client';

interface CourtReviewsModalProps {
  courtId: string;
  courtName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CourtReviewsModal = ({
  courtId,
  courtName,
  isOpen,
  onClose,
}: CourtReviewsModalProps) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [existingReview, setExistingReview] = useState<any>(null);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAuth();
      fetchRatingData();
      fetchUserReview();
    }
  }, [isOpen, courtId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const fetchRatingData = async () => {
    try {
      const data = await reviewsService.getCourtAverageRating(courtId);
      setRatingData(data);
    } catch (error) {
      console.error('Erro ao carregar rating:', error);
    }
  };

  const fetchUserReview = async () => {
    try {
      const review = await reviewsService.getUserReviewForCourt(courtId);
      setExistingReview(review);
      if (review) {
        setActiveTab('my-review');
      }
    } catch (error) {
      console.error('Erro ao carregar review do usuário:', error);
    }
  };

  const handleReviewSuccess = () => {
    fetchRatingData();
    fetchUserReview();
    setActiveTab('reviews');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Avaliações - {courtName}
          </DialogTitle>
          <DialogDescription>
            <CourtRating
              rating={ratingData.average}
              reviewCount={ratingData.count}
              size="lg"
            />
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">
              Avaliações ({ratingData.count})
            </TabsTrigger>
            <TabsTrigger value="my-review" disabled={!isAuthenticated}>
              {existingReview ? 'Minha Avaliação' : 'Avaliar'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            <CourtReviewsList
              courtId={courtId}
              onReviewsChange={fetchRatingData}
            />
          </TabsContent>

          <TabsContent value="my-review" className="mt-4">
            {isAuthenticated ? (
              <CourtReviewForm
                courtId={courtId}
                existingReview={existingReview}
                onSuccess={handleReviewSuccess}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Faça login para avaliar esta quadra</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CourtReviewsModal;
