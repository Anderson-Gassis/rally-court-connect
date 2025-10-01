import { supabase } from '@/integrations/supabase/client';
import { notificationsService } from './notificationsService';

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

      // Get challenger profile for notification
      const { data: challengerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.user.id)
        .single();

      const challengerName = challengerProfile?.full_name || 'Um jogador';

      // Create notification for the challenged player
      await notificationsService.createNotification({
        user_id: challengeData.challenged_id,
        type: 'challenge',
        title: 'Novo Convite para Jogo',
        message: `${challengerName} convidou você para uma partida em ${new Date(challengeData.preferred_date).toLocaleDateString('pt-BR')}`,
        data: {
          challenge_id: data.id,
          challenge_type: challengeData.challenge_type,
          preferred_date: challengeData.preferred_date,
          challenger_id: user.user.id,
          challenger_name: challengerName
        }
      });

      console.log('Challenge created and notification sent');
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