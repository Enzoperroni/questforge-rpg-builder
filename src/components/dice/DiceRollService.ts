
import { supabase } from '@/integrations/supabase/client';
import { DiceRoll } from './types';

export class DiceRollService {
  static async fetchRolls(campaignId: string): Promise<DiceRoll[]> {
    // First get the dice rolls
    const { data: rollsData, error: rollsError } = await supabase
      .from('dice_rolls')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (rollsError || !rollsData) {
      console.error('Error fetching rolls:', rollsError);
      return [];
    }

    // Then get the profiles for the users
    const userIds = [...new Set(rollsData.map(roll => roll.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    // Combine the data and ensure type safety
    const rollsWithProfiles = rollsData.map(roll => ({
      ...roll,
      roll_mode: (roll.roll_mode as 'sum' | 'separate' | 'advantage' | 'disadvantage') || 'sum',
      modifier: roll.modifier || 0,
      multiplier: roll.multiplier || 1,
      is_master_roll: roll.is_master_roll || false,
      hidden_from_players: roll.hidden_from_players || false,
      profiles: profilesData?.find(profile => profile.id === roll.user_id) || null
    }));

    return rollsWithProfiles;
  }

  static async saveRoll(
    campaignId: string,
    userId: string,
    diceType: string,
    rolls: number[],
    total: number,
    modifier: number,
    rollMode: 'sum' | 'separate' | 'advantage' | 'disadvantage',
    hiddenFromPlayers: boolean
  ) {
    const { error } = await supabase
      .from('dice_rolls')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        dice_type: diceType,
        rolls,
        total,
        modifier,
        multiplier: 1,
        is_master_roll: false,
        hidden_from_players: hiddenFromPlayers,
        roll_mode: rollMode
      });

    if (error) {
      throw new Error('Failed to save dice roll');
    }
  }

  static async clearRolls(campaignId: string) {
      const { data, error } = await supabase
          .from('dice_rolls')
          .delete()
          .eq('campaign_id', campaignId)
          .throwOnError();

    return { error, data };
  }
}
