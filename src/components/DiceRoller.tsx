
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

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
      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <img src="/lovable-uploads/d1af8a61-0046-4836-8ee2-076614377807.png" alt="D20" className="h-6 w-6 mr-2" />
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

      <Card className="tavern-card text-amber-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Roll History</CardTitle>
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearResults}
              className="tavern-button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-amber-200 text-center py-4">No rolls yet. Roll some dice to see results!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map(result => (
                <div key={result.id} className="p-3 tavern-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg text-amber-100">{result.dice}</span>
                    <span className="text-sm text-amber-300">{result.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-amber-200">Rolls:</span>
                      <span className="font-mono text-amber-100">[{result.rolls.join(', ')}]</span>
                    </div>
                    <div className="text-xl font-bold text-amber-400">
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
