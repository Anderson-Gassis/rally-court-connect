import { supabase } from '@/integrations/supabase/client';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  sport_type: string;
  owner_id: string;
  avatar_url: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  is_member?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const groupsService = {
  async getGroups(sportType?: string): Promise<Group[]> {
    let query = supabase
      .from('groups' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (sportType) {
      query = query.eq('sport_type', sportType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch groups: ${error.message}`);
    return (data || []) as unknown as Group[];
  },

  async getMyGroups(userId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('group_members' as any)
      .select('group_id, groups(*)')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to fetch my groups: ${error.message}`);
    return (data || []).map((row: any) => row.groups).filter(Boolean) as unknown as Group[];
  },

  async createGroup(data: {
    name: string;
    description?: string;
    sport_type: string;
    is_private?: boolean;
    owner_id: string;
  }): Promise<Group> {
    // 1. Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups' as any)
      .insert({
        name: data.name,
        description: data.description || null,
        sport_type: data.sport_type,
        is_private: data.is_private ?? false,
        owner_id: data.owner_id,
      })
      .select()
      .single();

    if (groupError) throw new Error(`Failed to create group: ${groupError.message}`);

    // 2. Add owner as member with role 'owner'
    await supabase
      .from('group_members' as any)
      .insert({
        group_id: (group as any).id,
        user_id: data.owner_id,
        role: 'owner',
      });

    return group as unknown as Group;
  },

  async joinGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members' as any)
      .insert({ group_id: groupId, user_id: userId, role: 'member' });

    if (error) throw new Error(`Failed to join group: ${error.message}`);
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members' as any)
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to leave group: ${error.message}`);
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from('group_members' as any)
      .select(`
        *,
        profile:profiles!user_id (full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch group members: ${error.message}`);
    return (data || []) as unknown as GroupMember[];
  },

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('group_members' as any)
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') return false;
    return !!data;
  },
};
