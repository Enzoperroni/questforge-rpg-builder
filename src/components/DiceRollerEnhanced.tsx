
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiceRoll } from './dice/types';
import { DiceRollService } from './dice/DiceRollService';
import DiceRollsPanel from './dice/DiceRollsPanel';
import RollHistoryPanel from './dice/RollHistoryPanel';
import { Checkbox } from '@/components/ui/checkbox';

interface DiceRollerEnhancedProps {
  campaignId: string;
  isMaster: boolean;
  userId: string;
  hideMasterRolls?: boolean;
  onHideMasterRollsChange?: (hidden: boolean) => void;
}

const DiceRollerEnhanced = ({ 
  campaignId, 
  isMaster, 
  userId, 
  hideMasterRolls = false,
  onHideMasterRollsChange 
}: DiceRollerEnhancedProps) => {
  const [results, setResults] = useState<DiceRoll[]>([]);

  useEffect(() => {
    fetchRolls();
    
    const channel = supabase
      .channel('dice-rolls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_rolls',
          filter: `campaign_id=eq.${campaignId}`
        },
        () => fetchRolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const fetchRolls = async () => {
    const rolls = await DiceRollService.fetchRolls(campaignId);
    setResults(rolls);
  };

  return (
    <div className="space-y-6">
      {isMaster && onHideMasterRollsChange && (
        <div className="flex items-center space-x-2 p-4 bg-amber-950/20 rounded-lg border border-amber-700/30">
          <Checkbox
            id="hide-master-rolls"
            checked={hideMasterRolls}
            onCheckedChange={onHideMasterRollsChange}
            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
          />
          <label
            htmlFor="hide-master-rolls"
            className="text-amber-200 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Hide my rolls from players
          </label>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiceRollsPanel
          campaignId={campaignId}
          userId={userId}
          isMaster={isMaster}
          onRollComplete={fetchRolls}
          hideMasterRolls={hideMasterRolls}
        />
        <RollHistoryPanel
          results={results}
          isMaster={isMaster}
          userId={userId}
          campaignId={campaignId}
          onClearComplete={fetchRolls}
        />
      </div>
    </div>
  );
};

export default DiceRollerEnhanced;
