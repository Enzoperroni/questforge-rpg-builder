
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, RotateCcw } from 'lucide-react';

const DiceRoller = () => {
  const [results, setResults] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const diceTypes = [
    { sides: 4, name: 'D4' },
    { sides: 6, name: 'D6' },
    { sides: 8, name: 'D8' },
    { sides: 10, name: 'D10' },
    { sides: 12, name: 'D12' },
    { sides: 20, name: 'D20' },
    { sides: 100, name: 'D100' }
  ];

  const rollDice = (sides, count = 1) => {
    setIsRolling(true);
    
    setTimeout(() => {
      const rolls = [];
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      const result = {
        id: Date.now(),
        dice: `${count}d${sides}`,
        rolls,
        total,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setResults(prev => [result, ...prev.slice(0, 9)]);
      setIsRolling(false);
    }, 500);
  };

  const clearResults = () => {
    setResults([]);
  };

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
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearResults}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-blue-200 text-center py-4">No rolls yet. Roll some dice to see results!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map(result => (
                <div key={result.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{result.dice}</span>
                    <span className="text-sm text-blue-200">{result.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-200">Rolls:</span>
                      <span className="font-mono">[{result.rolls.join(', ')}]</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                      Total: {result.total}
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

export default DiceRoller;
