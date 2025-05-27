
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, RotateCcw, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiceRoll {
  id: string;
  dice_type: string;
  rolls: number[];
  total: number;
  modifier: number;
  multiplier: number;
  user_id: string;
  is_master_roll: boolean;
  created_at: string;
  profiles?: { username: string };
}

interface DiceRollerEnhancedProps {
  campaignId: string;
  isMaster: boolean;
  userId: string;
}

const DiceRollerEnhanced = ({ campaignId, isMaster, userId }: DiceRollerEnhancedProps) => {
  const [results, setResults] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [modifier, setModifier] = useState(0);
  const [rollCount, setRollCount] = useState(1);
  const { toast } = useToast();

  const diceTypes = [
    { sides: 4, name: 'D4' },
    { sides: 6, name: 'D6' },
    { sides: 8, name: 'D8' },
    { sides: 10, name: 'D10' },
    { sides: 12, name: 'D12' },
    { sides: 20, name: 'D20' },
    { sides: 100, name: 'D100' }
  ];

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
    const { data, error } = await supabase
      .from('dice_rolls')
      .select(`
        *,
        profiles(username)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setResults(data);
    }
  };

  const rollDice = async (sides: number, count = 1, isMasterRoll = false) => {
    setIsRolling(true);
    
    setTimeout(async () => {
      for (let rollIndex = 0; rollIndex < rollCount; rollIndex++) {
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          total += roll;
        }
        
        const finalTotal = total + modifier;
        
        const { error } = await supabase
          .from('dice_rolls')
          .insert({
            campaign_id: campaignId,
            user_id: userId,
            dice_type: `${count}d${sides}`,
            rolls,
            total: finalTotal,
            modifier,
            multiplier: rollCount,
            is_master_roll: isMasterRoll
          });

        if (error) {
          toast({
            title: "Error",
            description: "Failed to save dice roll",
            variant: "destructive"
          });
        }
      }
      
      setIsRolling(false);
    }, 500);
  };

  const clearResults = async () => {
    if (isMaster) {
      await supabase
        .from('dice_rolls')
        .delete()
        .eq('campaign_id', campaignId);
      
      setResults([]);
    }
  };

  const filteredResults = results.filter(result => {
    if (isMaster) return true;
    if (result.user_id === userId) return true;
    return !result.is_master_roll;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Dice6 className="h-6 w-6 mr-2" />
            Dice Roller
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-blue-200 block mb-2">Modifier</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModifier(Math.max(-99, modifier - 1))}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="bg-white/20 border-white/30 text-white text-center w-20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModifier(Math.min(99, modifier + 1))}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-blue-200 block mb-2">Roll Count</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRollCount(Math.max(1, rollCount - 1))}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={rollCount}
                  onChange={(e) => setRollCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-white/20 border-white/30 text-white text-center w-20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRollCount(Math.min(10, rollCount + 1))}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {diceTypes.map(dice => (
              <Button
                key={dice.sides}
                onClick={() => rollDice(dice.sides)}
                disabled={isRolling}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-12"
              >
                {dice.name}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Multiple Dice</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => rollDice(6, 2)}
                disabled={isRolling}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                2D6
              </Button>
              <Button
                onClick={() => rollDice(6, 3)}
                disabled={isRolling}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                3D6
              </Button>
              <Button
                onClick={() => rollDice(6, 4)}
                disabled={isRolling}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                4D6
              </Button>
              <Button
                onClick={() => rollDice(20, 2)}
                disabled={isRolling}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                2D20
              </Button>
            </div>
          </div>

          {isMaster && (
            <Button
              onClick={() => rollDice(20, 1, true)}
              disabled={isRolling}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              Master Roll (Hidden)
            </Button>
          )}
          
          {isRolling && (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              <p className="mt-2 text-blue-200">Rolling...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Roll History</CardTitle>
          {isMaster && filteredResults.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearResults}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <p className="text-blue-200 text-center py-4">No rolls yet. Roll some dice to see results!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredResults.map(result => (
                <div key={result.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">{result.dice_type}</span>
                      {result.is_master_roll && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">GM</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-200">{result.profiles?.username || 'Unknown'}</div>
                      <div className="text-xs text-blue-300">
                        {new Date(result.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-200">Rolls:</span>
                      <span className="font-mono">[{result.rolls.join(', ')}]</span>
                      {result.modifier !== 0 && (
                        <span className="text-sm text-yellow-400">
                          {result.modifier > 0 ? '+' : ''}{result.modifier}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      {result.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiceRollerEnhanced;
