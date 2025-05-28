
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

    // Combine the data
    const rollsWithProfiles = rollsData.map(roll => ({
      ...roll,
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
    isMasterRoll: boolean
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
        is_master_roll: isMasterRoll
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
          .throwOnError(); // <- IMPORTANTE!

      /*if (error) {
          console.error('Erro ao deletar:', error.message);
      } else {
          console.log('Linhas deletadas:', data);
      }*/

    return { error, data };
  }
}
