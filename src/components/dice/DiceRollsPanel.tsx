
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, Minus } from 'lucide-react';
import { DiceRollService } from './DiceRollService';

interface DiceRollsPanelProps {
  campaignId: string;
  userId: string;
  isMaster: boolean;
  onRollComplete: () => void;
}

const diceTypes = [
  { sides: 4, name: 'd4', icon: Dice1 },
  { sides: 6, name: 'd6', icon: Dice2 },
  { sides: 8, name: 'd8', icon: Dice3 },
  { sides: 10, name: 'd10', icon: Dice4 },
  { sides: 12, name: 'd12', icon: Dice5 },
  { sides: 20, name: 'd20', icon: Dice6 },
  { sides: 100, name: 'd100', icon: Dice6 }
];

const DiceRollsPanel = ({ campaignId, userId, isMaster, onRollComplete }: DiceRollsPanelProps) => {
  const [selectedDice, setSelectedDice] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollMode, setRollMode] = useState<'sum' | 'separate' | 'advantage' | 'disadvantage'>('sum');
  const [hideFromPlayers, setHideFromPlayers] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = async () => {
    setIsRolling(true);
    try {
      const rolls: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        rolls.push(Math.floor(Math.random() * selectedDice) + 1);
      }

      let total = 0;
      if (rollMode === 'sum') {
        total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
      } else if (rollMode === 'advantage') {
        total = Math.max(...rolls) + modifier;
      } else if (rollMode === 'disadvantage') {
        total = Math.min(...rolls) + modifier;
      } else {
        // For separate rolls, we'll use the sum but display them separately
        total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
      }

      const diceType = `${diceCount}d${selectedDice}`;
      
      await DiceRollService.saveRoll(
        campaignId,
        userId,
        diceType,
        rolls,
        total,
        modifier,
        rollMode,
        isMaster && hideFromPlayers
      );

      onRollComplete();
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const adjustDiceCount = (increment: boolean) => {
    setDiceCount(prev => {
      const newCount = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(20, newCount));
    });
  };

  const adjustModifier = (increment: boolean) => {
    setModifier(prev => {
      const newModifier = increment ? prev + 1 : prev - 1;
      return Math.max(-99, Math.min(99, newModifier));
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Dice6 className="h-6 w-6 text-amber-400" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-blue-200 mb-3 block">Dice Type</Label>
          <div className="grid grid-cols-4 gap-2">
            {diceTypes.map(({ sides, name, icon: Icon }) => (
              <Button
                key={sides}
                variant={selectedDice === sides ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDice(sides)}
                className={`${
                  selectedDice === sides
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-blue-200 mb-2 block">Number of Dice</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDiceCount(false)}
                disabled={diceCount <= 1}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="bg-white/20 border-white/30 text-white text-center"
                min="1"
                max="20"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDiceCount(true)}
                disabled={diceCount >= 20}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-blue-200 mb-2 block">Modifier</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustModifier(false)}
                disabled={modifier <= -99}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(Math.max(-99, Math.min(99, parseInt(e.target.value) || 0)))}
                className="bg-white/20 border-white/30 text-white text-center"
                min="-99"
                max="99"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustModifier(true)}
                disabled={modifier >= 99}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-blue-200 mb-3 block">Roll Mode</Label>
          <RadioGroup value={rollMode} onValueChange={(value: any) => setRollMode(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sum" id="sum" className="border-white/30" />
              <Label htmlFor="sum" className="text-blue-200">Sum all dice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="separate" id="separate" className="border-white/30" />
              <Label htmlFor="separate" className="text-blue-200">Show separately</Label>
            </div>
            {diceCount === 2 && (
              <>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advantage" id="advantage" className="border-white/30" />
                  <Label htmlFor="advantage" className="text-blue-200">Advantage (higher)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disadvantage" id="disadvantage" className="border-white/30" />
                  <Label htmlFor="disadvantage" className="text-blue-200">Disadvantage (lower)</Label>
                </div>
              </>
            )}
          </RadioGroup>
        </div>

        {isMaster && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hideFromPlayers"
              checked={hideFromPlayers}
              onCheckedChange={setHideFromPlayers}
              className="border-white/30"
            />
            <Label htmlFor="hideFromPlayers" className="text-blue-200">
              Hide from Players (Master Only)
            </Label>
          </div>
        )}

        <Button
          onClick={rollDice}
          disabled={isRolling}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
        >
          {isRolling ? 'Rolling...' : `Roll ${diceCount}d${selectedDice}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DiceRollsPanel;
