
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlayerManager = ({ campaign, updateCampaign }) => {
  const [playerCharacters, setPlayerCharacters] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load all player characters for this campaign
    const characters = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`character_${campaign.code}_`)) {
        const character = JSON.parse(localStorage.getItem(key) || '{}');
        characters.push({ ...character, storageKey: key });
      }
    }
    setPlayerCharacters(characters);
  }, [campaign.code]);

  const removeCharacter = (storageKey) => {
    localStorage.removeItem(storageKey);
    setPlayerCharacters(prev => prev.filter(char => char.storageKey !== storageKey));
    
    toast({
      title: "Character Removed",
      description: "Player character has been removed from the campaign",
    });
  };

  const viewCharacter = (character) => {
    // Create a detailed view modal or expand functionality
    console.log('Viewing character:', character);
    toast({
      title: "Character Details",
      description: `Viewing ${character.name || 'Unnamed Character'}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Player Characters</CardTitle>
        </CardHeader>
        <CardContent>
          {playerCharacters.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">No player characters created yet. Players will appear here once they create their characters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerCharacters.map((character, index) => (
                <div key={character.storageKey || index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.image} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {character.name ? character.name.charAt(0).toUpperCase() : 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewCharacter(character)}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCharacter(character.storageKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{character.name || 'Unnamed Character'}</h3>
                  <div className="text-sm text-blue-200">
                    <p>Created: {new Date(character.createdAt).toLocaleDateString()}</p>
                    {character.data && Object.keys(character.data).length > 0 && (
                      <p className="mt-1">Fields: {Object.keys(character.data).length}</p>
                    )}
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

export default PlayerManager;
