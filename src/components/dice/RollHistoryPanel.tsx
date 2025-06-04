
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { DiceRoll } from './types';
import { DiceRollService } from './DiceRollService';

interface RollHistoryPanelProps {
  results: DiceRoll[];
  isMaster: boolean;
  userId: string;
  campaignId: string;
  onClearComplete: () => void;
}

// Mapeamento legível de modos de rolagem
const rollModeMap: Record<string, string> = {
  sum: 'Soma',
  separate: 'Separado',
  advantage: 'Vantagem',
  disadvantage: 'Desvantagem'
};

const RollHistoryPanel = ({ results, isMaster, userId, campaignId, onClearComplete }: RollHistoryPanelProps) => {
  const clearResults = async () => {
    if (isMaster) {
      await DiceRollService.clearRolls(campaignId);
      onClearComplete();
    }
  };

  const filteredResults = results.filter(result => {
    if (isMaster) return true;
    if (result.user_id === userId) return true;
    if (result.hidden_from_players) return false;
    return !result.is_master_roll;
  });

  return (
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
                {filteredResults.slice().reverse().map(result => (
                    <div key={result.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-lg">{result.dice_type}</span>
                          {result.is_master_roll && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">GM</span>
                          )}
                          {result.hidden_from_players && isMaster && (
                              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Hidden</span>
                          )}
                          <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                      {rollModeMap[result.roll_mode] ?? 'Desconhecido'}
                    </span>
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
  );
};

export default RollHistoryPanel;
