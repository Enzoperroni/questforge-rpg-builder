
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
  roll_mode: 'sum' | 'separate' | 'advantage' | 'disadvantage';
  profiles?: { username?: string } | null;
}

export interface DiceType {
  sides: number;
  name: string;
}
