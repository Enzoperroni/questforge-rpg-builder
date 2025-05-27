
export interface DiceRoll {
  id: string;
  dice_type: string;
  rolls: number[];
  total: number;
  modifier: number;
  multiplier: number;
  user_id: string;
  is_master_roll: boolean;
  created_at: string;
  profiles?: { username?: string } | null;
}

export interface DiceType {
  sides: number;
  name: string;
}
