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

  const rollDice = async (sides: number, count = 1, isMasterRoll = false) => {
    setIsRolling(true);

    setTimeout(async () => {
      try {
        const allRolls: number[] = [];
        let total = 0;

        for (let i = 0; i < rollCount * count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          allRolls.push(roll);
          total += roll;
        }

        const finalTotal = total + modifier*rollCount;

        await DiceRollService.saveRoll(
            campaignId,
            userId,
            `${rollCount}x${count}d${sides}`,
            allRolls,
            finalTotal,
            modifier,
            isMasterRoll
        );

        onRollComplete();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao salvar a rolagem de dados.",
          variant: "destructive"
        });
      } finally {
        setIsRolling(false);
      }
    }, 500);
  };


  return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Dice6 className="h-6 w-6 mr-2" />
              Dice Roller
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
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
  );
};

export default DiceRollsPanel;
