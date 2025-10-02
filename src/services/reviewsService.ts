import { supabase } from '@/integrations/supabase/client';

export interface CourtReview {
  id: string;
  court_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateReviewData {
  court_id: string;
  rating: number;
  comment?: string;
}

export const reviewsService = {
  async getCourtReviews(courtId: string) {
    const { data: reviews, error } = await supabase
      .from('court_reviews')
      .select('*')
      .eq('court_id', courtId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!reviews) return [];

    // Fetch user profiles separately
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .in('user_id', userIds);

    // Merge reviews with user data
    const reviewsWithUsers = reviews.map(review => ({
      ...review,
      user: profiles?.find(p => p.user_id === review.user_id) || null
    }));

    return reviewsWithUsers as CourtReview[];
  },

  async createReview(reviewData: CreateReviewData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('court_reviews')
      .insert({
        ...reviewData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, rating: number, comment?: string) {
    const { data, error } = await supabase
      .from('court_reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('court_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getUserReviewForCourt(courtId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('court_reviews')
      .select('*')
      .eq('court_id', courtId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCourtAverageRating(courtId: string) {
    const { data, error } = await supabase
      .from('court_reviews')
      .select('rating')
      .eq('court_id', courtId);

    if (error) throw error;
    
    if (!data || data.length === 0) return { average: 0, count: 0 };
    
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const average = Math.round((sum / data.length) * 10) / 10;
    
    return { average, count: data.length };
  },
};
