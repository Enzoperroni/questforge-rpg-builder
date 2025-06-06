import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown } from 'lucide-react';
import { DiceType } from './types';
import { DiceRollService } from './DiceRollService';

interface DiceRollsPanelProps {
  campaignId: string;
  userId: string;
  isMaster: boolean;
  onRollComplete: () => void;
}

const diceTypes: DiceType[] = [
  { sides: 4, name: 'd4' },
  { sides: 6, name: 'd6' },
  { sides: 8, name: 'd8' },
  { sides: 10, name: 'd10' },
  { sides: 12, name: 'd12' },
  { sides: 20, name: 'd20' },
  { sides: 100, name: 'd100' }
];

const rollModes = [
  { value: 'sum', label: 'Sum' },
  { value: 'separate', label: 'Separate' },
  { value: 'advantage', label: 'Advantage' },
  { value: 'disadvantage', label: 'Disadvantage' }
];

const DiceRollsPanel = ({ campaignId, userId, isMaster, onRollComplete }: DiceRollsPanelProps) => {
  const [selectedDice, setSelectedDice] = useState<DiceType>(diceTypes[5]); // d20 default
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollMode, setRollMode] = useState<'sum' | 'separate' | 'advantage' | 'disadvantage'>('sum');
  const [isRolling, setIsRolling] = useState(false);
  const [isMasterRoll, setIsMasterRoll] = useState(false);

  const rollDice = async () => {
    setIsRolling(true);
    
    try {
      let rolls: number[] = [];
      let total = 0;
      
      if (rollMode === 'advantage' || rollMode === 'disadvantage') {
        // For advantage/disadvantage, always roll 2 dice regardless of diceCount
        const roll1 = Math.floor(Math.random() * selectedDice.sides) + 1;
        const roll2 = Math.floor(Math.random() * selectedDice.sides) + 1;
        rolls = [roll1, roll2];
        
        if (rollMode === 'advantage') {
          total = Math.max(roll1, roll2) + modifier;
        } else {
          total = Math.min(roll1, roll2) + modifier;
        }
      } else {
        // Normal rolling
        for (let i = 0; i < diceCount; i++) {
          const roll = Math.floor(Math.random() * selectedDice.sides) + 1;
          rolls.push(roll);
        }
        
        if (rollMode === 'sum') {
          total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
        } else {
          // For separate mode, total is just the sum for storage, but displayed separately
          total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
        }
      }

      const diceType = `${diceCount}${selectedDice.name}`;
      
      await DiceRollService.saveRoll(
        campaignId,
        userId,
        diceType,
        rolls,
        total,
        modifier,
        rollMode,
        isMasterRoll
      );
      
      onRollComplete();
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const getDiceIcon = (sides: number) => {
    switch (sides) {
      case 4: return <Dice1 className="h-4 w-4" />;
      case 6: return <Dice6 className="h-4 w-4" />;
      case 8: return <Dice2 className="h-4 w-4" />;
      case 10: return <Dice3 className="h-4 w-4" />;
      case 12: return <Dice4 className="h-4 w-4" />;
      case 20: return <Dice5 className="h-4 w-4" />;
      case 100: return <Dice6 className="h-4 w-4" />;
      default: return <Dice6 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {getDiceIcon(selectedDice.sides)}
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dice Type</label>
            <Select value={selectedDice.name} onValueChange={(value) => {
              const dice = diceTypes.find(d => d.name === value);
              if (dice) setSelectedDice(dice);
            }}>
              <SelectTrigger className="bg-white/20 border-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {diceTypes.map(dice => (
                  <SelectItem key={dice.name} value={dice.name}>
                    <div className="flex items-center gap-2">
                      {getDiceIcon(dice.sides)}
                      {dice.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Count</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-white/20 border-white/30"
              disabled={rollMode === 'advantage' || rollMode === 'disadvantage'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Roll Mode</label>
            <Select value={rollMode} onValueChange={(value: 'sum' | 'separate' | 'advantage' | 'disadvantage') => setRollMode(value)}>
              <SelectTrigger className="bg-white/20 border-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rollModes.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modifier</label>
            <Input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="bg-white/20 border-white/30"
              placeholder="0"
            />
          </div>
        </div>

        {isMaster && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="masterRoll"
              checked={isMasterRoll}
              onChange={(e) => setIsMasterRoll(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="masterRoll" className="text-sm font-medium flex items-center gap-1">
              <Crown className="h-4 w-4" />
              Master Roll
            </label>
          </div>
        )}

        <Button
          onClick={rollDice}
          disabled={isRolling}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
        >
          {isRolling ? 'Rolling...' : `Roll ${diceCount}${selectedDice.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DiceRollsPanel;
