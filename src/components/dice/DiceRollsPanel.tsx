
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, Plus, Minus, RotateCcw } from 'lucide-react';
import { DiceType } from './types';
import { DiceRollService } from './DiceRollService';
import { useToast } from '@/hooks/use-toast';

interface DiceRollsPanelProps {
  campaignId: string;
  userId: string;
  isMaster: boolean;
  onRollComplete: () => void;
}

const DiceRollsPanel = ({ campaignId, userId, isMaster, onRollComplete }: DiceRollsPanelProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [modifier, setModifier] = useState(0);
  const [rollCount, setRollCount] = useState(1);
  const [rollMode, setRollMode] = useState<'sum' | 'separate'|'advantage'|'disadvantage'>('sum');
  const { toast } = useToast();

  const diceTypes: DiceType[] = [
    { sides: 4, name: 'D4' },
    { sides: 6, name: 'D6' },
    { sides: 8, name: 'D8' },
    { sides: 10, name: 'D10' },
    { sides: 12, name: 'D12' },
    { sides: 20, name: 'D20' },
    { sides: 100, name: 'D100' }
  ];

  const rollDice = async (sides: number, count = 1) => {
    setIsRolling(true);

    setTimeout(async () => {
      try {
        const allRolls: number[] = [];
        let total = 0;

        if (rollMode === 'sum') {
          // Sum all dice and add modifier once
          for (let i = 0; i < rollCount * count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            allRolls.push(roll);
            total += roll;
          }
          total += modifier;
        } else if (rollMode === 'separate') {
          // Separate dice, add modifier to each roll (only at the end)
          for (let i = 0; i < rollCount * count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            allRolls.push(roll);
            total += roll; // Apenas soma o dado puro aqui
          }

          // Aplica o modificador uma vez para cada dado, após a rolagem
          total += modifier * (rollCount * count);
        } else if (rollMode === 'advantage') {
          total = 0;
          for (let i = 0; i < rollCount * count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            allRolls.push(roll);

            // Verifica se esse é o maior valor até agora
            if (roll > total) {
              total = roll;
            }

            // Se for o último dado, adiciona o modificador
            if (i === (rollCount * count) - 1) {
              total += modifier;
            }
          }
        }else if (rollMode === 'disadvantage') {
        total = 101; // começa com o maior possível para achar o menor

        for (let i = 0; i < rollCount * count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          allRolls.push(roll);

          if (roll < total) {
            total = roll; // salva o menor valor
          }

          // Se for o último dado, adiciona o modificador
          if (i === (rollCount * count) - 1) {
            total += modifier;
          }
        }
      }


      await DiceRollService.saveRoll(
            campaignId,
            userId,
            `${rollCount}x${count}d${sides}`,
            allRolls,
            total,
            modifier,
            rollMode,
            false
        );

        onRollComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save dice roll.",
          variant: "destructive"
        });
      } finally {
        setIsRolling(false);
      }
    }, 500);
  };

  return (
      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Dice6 className="h-6 w-6 mr-2 text-amber-400" />
              Dice Roller
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="icon"
                  className="tavern-button"
                  onClick={onRollComplete}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-amber-200 block mb-2">Modifier</label>
              <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModifier(Math.max(-99, modifier - 1))}
                    className="tavern-button"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    className="tavern-input text-center w-20"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModifier(Math.min(99, modifier + 1))}
                    className="tavern-button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-amber-200 block mb-2">Roll Count</label>
              <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRollCount(Math.max(1, rollCount - 1))}
                    className="tavern-button"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={rollCount}
                    onChange={(e) => setRollCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="tavern-input text-center w-20"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRollCount(Math.min(10, rollCount + 1))}
                    className="tavern-button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-amber-200 block mb-2">Roll Mode</label>
            <div className="flex space-x-2">
              <Button
                variant={rollMode === 'sum' ? 'default' : 'outline'}
                onClick={() => setRollMode('sum')}
                className={rollMode === 'sum' ? 'tavern-button' : 'tavern-button bg-amber-950/40'}
              >
                Sum Total
              </Button>
              <Button
                variant={rollMode === 'separate' ? 'default' : 'outline'}
                onClick={() => setRollMode('separate')}
                className={rollMode === 'separate' ? 'tavern-button' : 'tavern-button bg-amber-950/40'}
              >
                Separate Dice
              </Button>
              <Button
                  variant={rollMode === 'advantage' ? 'default' : 'outline'}
                  onClick={() => setRollMode('advantage')}
                  className={rollMode === 'advantage' ? 'tavern-button' : 'tavern-button bg-amber-950/40'}
              >
                Advantage Dice
              </Button>
              <Button
                  variant={rollMode === 'disadvantage' ? 'default' : 'outline'}
                  onClick={() => setRollMode('disadvantage')}
                  className={rollMode === 'disadvantage' ? 'tavern-button' : 'tavern-button bg-amber-950/40'}
              >
                Disadvantage Dice
              </Button>
            </div>
            <p className="text-xs text-amber-300 mt-1">
              {rollMode === 'sum' ? 'Add modifier to total sum' : rollMode === 'separate' ? 'Add modifier to each die' : rollMode === 'advantage' ? 'Add modifier to highest roll' : 'Add modifier to lowest roll'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {diceTypes.map(dice => (
                <Button
                    key={dice.sides}
                    onClick={() => rollDice(dice.sides)}
                    disabled={isRolling}
                    className="tavern-button h-12 font-semibold"
                >
                  {dice.name}
                </Button>
            ))}
          </div>

          {isRolling && (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-amber-200">Rolling...</p>
              </div>
          )}
        </CardContent>
      </Card>
  );
};

export default DiceRollsPanel;
