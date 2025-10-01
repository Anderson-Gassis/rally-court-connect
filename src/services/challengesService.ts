import { supabase } from '@/integrations/supabase/client';
import { notificationsService } from './notificationsService';
import { rankingService } from './rankingService';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: string;
  preferred_date: string;
  preferred_time?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
  challenger_profile?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url?: string;
  };
  challenged_profile?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const challengesService = {
  async createChallenge(challengeData: {
    challenged_id: string;
    challenge_type: string;
    preferred_date: string;
    preferred_time?: string;
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
      const dateStr = new Date(challengeData.preferred_date).toLocaleDateString('pt-BR');
      const timeStr = challengeData.preferred_time ? ` às ${challengeData.preferred_time}` : '';
      
      await notificationsService.createNotification({
        user_id: challengeData.challenged_id,
        type: 'challenge',
        title: 'Novo Convite para Jogo',
        message: `${challengerName} convidou você para uma partida em ${dateStr}${timeStr}`,
        data: {
          challenge_id: data.id,
          challenge_type: challengeData.challenge_type,
          preferred_date: challengeData.preferred_date,
          preferred_time: challengeData.preferred_time,
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenges')
        .update({ status })
        .eq('id', challengeId);

      if (error) throw error;

      // Get challenge details for notification
      const { data: challenge } = await supabase
        .from('challenges')
        .select('*, challenger_id, challenged_id')
        .eq('id', challengeId)
        .single();

      if (!challenge) return;

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.user.id)
        .single();

      const userName = userProfile?.full_name || 'Um jogador';

      // Send notification to challenger
      if (status === 'accepted') {
        await notificationsService.createNotification({
          user_id: challenge.challenger_id,
          type: 'challenge',
          title: 'Convite Aceito!',
          message: `${userName} aceitou seu convite para jogar!`,
          data: {
            challenge_id: challengeId,
            action: 'accepted'
          }
        });
      } else if (status === 'declined') {
        await notificationsService.createNotification({
          user_id: challenge.challenger_id,
          type: 'challenge',
          title: 'Convite Recusado',
          message: `${userName} recusou seu convite para jogar.`,
          data: {
            challenge_id: challengeId,
            action: 'declined'
          }
        });
      }
    } catch (error) {
      console.error('Error updating challenge status:', error);
      throw error;
    }
  },

  async getChallengesWithProfiles(): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Buscar challenges do usuário
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user.user.id},challenged_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;
      if (!challenges || challenges.length === 0) return [];

      // Buscar perfis dos challengers e challenged
      const challengerIds = [...new Set(challenges.map(c => c.challenger_id))];
      const challengedIds = [...new Set(challenges.map(c => c.challenged_id))];
      const allUserIds = [...new Set([...challengerIds, ...challengedIds])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url')
        .in('user_id', allUserIds);

      if (profilesError) throw profilesError;

      // Map profiles to challenges
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const challengesWithProfiles = challenges.map(challenge => ({
        ...challenge,
        challenger_profile: profileMap.get(challenge.challenger_id),
        challenged_profile: profileMap.get(challenge.challenged_id)
      }));

      return challengesWithProfiles;
    } catch (error) {
      console.error('Error fetching challenges with profiles:', error);
      return [];
    }
  },

  async reportResult(challengeId: string, result: 'win' | 'loss', score: string, notes?: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get challenge details
      const { data: challenge } = await supabase
        .from('challenges')
        .select('*, challenger_id, challenged_id')
        .eq('id', challengeId)
        .single();

      if (!challenge) throw new Error('Challenge not found');

      // Determine opponent
      const isChallenger = challenge.challenger_id === user.user.id;
      const opponentId = isChallenger ? challenge.challenged_id : challenge.challenger_id;

      // Get opponent profile
      const { data: opponentProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', opponentId)
        .single();

      const opponentName = opponentProfile?.full_name || 'Oponente';

      // Convert result to Portuguese for database
      const resultInPortuguese = result === 'win' ? 'vitória' : 'derrota';
      
      // Record match result and update rankings
      await rankingService.recordMatchResult(
        user.user.id,
        opponentId,
        opponentName,
        resultInPortuguese,
        score,
        new Date(challenge.preferred_date),
        challenge.challenge_type,
        undefined, // courtName
        notes,
        'challenge'
      );

      // Update challenge status to completed
      const { error: updateError } = await supabase
        .from('challenges')
        .update({ status: 'completed' })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.user.id)
        .single();

      const userName = userProfile?.full_name || 'Um jogador';

      // Send notification to opponent
      await notificationsService.createNotification({
        user_id: opponentId,
        type: 'match_result',
        title: 'Resultado Reportado',
        message: `${userName} reportou o resultado da partida: ${score}. Seu ranking foi atualizado!`,
        data: {
          challenge_id: challengeId,
          result: result === 'win' ? 'loss' : 'win', // Opposite for opponent
          score
        }
      });
    } catch (error) {
      console.error('Error reporting result:', error);
      throw error;
    }
  }
};