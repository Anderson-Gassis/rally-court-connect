import { supabase } from '@/integrations/supabase/client';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: string;
  preferred_date: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
}

export const challengesService = {
  async createChallenge(challengeData: {
    challenged_id: string;
    challenge_type: string;
    preferred_date: string;
    message?: string;
  }): Promise<Challenge> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: user.user.id,
          ...challengeData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  async getChallenges(): Promise<Challenge[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user.user.id},challenged_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Challenge[]) || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  },

  async updateChallengeStatus(challengeId: string, status: 'accepted' | 'declined'): Promise<void> {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status })
        .eq('id', challengeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating challenge status:', error);
      throw error;
    }
  }
};