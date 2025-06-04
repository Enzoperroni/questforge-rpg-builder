
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiceRoll } from './dice/types';
import { DiceRollService } from './dice/DiceRollService';
import DiceRollsPanel from './dice/DiceRollsPanel';
import RollHistoryPanel from './dice/RollHistoryPanel';

interface DiceRollerEnhancedProps {
  campaignId: string;
  isMaster: boolean;
  userId: string;
}

const DiceRollerEnhanced = ({ campaignId, isMaster, userId }: DiceRollerEnhancedProps) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DiceRollsPanel
        campaignId={campaignId}
        userId={userId}
        isMaster={isMaster}
        onRollComplete={fetchRolls}
      />
      <RollHistoryPanel
        results={results}
        isMaster={isMaster}
        userId={userId}
        campaignId={campaignId}
        onClearComplete={fetchRolls}
      />
    </div>
  );
};

export default DiceRollerEnhanced;
