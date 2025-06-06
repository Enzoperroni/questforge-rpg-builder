
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiceRoll } from './dice/types';
import { DiceRollService } from './dice/DiceRollService';
import DiceRollsPanel from './dice/DiceRollsPanel';
import RollHistoryPanel from './dice/RollHistoryPanel';
import MasterRollHistoryPanel from './dice/MasterRollHistoryPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DiceRollerMasterProps {
  campaignId: string;
  userId: string;
}

const DiceRollerMaster = ({ campaignId, userId }: DiceRollerMasterProps) => {
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
        isMaster={true}
        onRollComplete={fetchRolls}
      />
      <div>
        <Tabs defaultValue="regular" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 tavern-card">
            <TabsTrigger value="regular" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              Roll History
            </TabsTrigger>
            <TabsTrigger value="master" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              Master Rolls
            </TabsTrigger>
          </TabsList>
          <TabsContent value="regular">
            <RollHistoryPanel
              results={results}
              isMaster={true}
              userId={userId}
              campaignId={campaignId}
              onClearComplete={fetchRolls}
            />
          </TabsContent>
          <TabsContent value="master">
            <MasterRollHistoryPanel
              results={results}
              campaignId={campaignId}
              onClearComplete={fetchRolls}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiceRollerMaster;
