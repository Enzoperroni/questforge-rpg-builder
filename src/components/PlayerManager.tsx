
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User } from 'lucide-react';

const PlayerManager = ({ campaign }) => {
  const getPlayerCharacters = () => {
    const characters = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`character_${campaign.code}_`)) {
        const character = JSON.parse(localStorage.getItem(key));
        characters.push(character);
      }
    }
    return characters;
  };

  const playerCharacters = getPlayerCharacters();

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Player Characters ({playerCharacters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerCharacters.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">No players have joined yet.</p>
              <p className="text-sm text-blue-300 mt-2">Share your campaign code: <span className="font-mono bg-white/20 px-2 py-1 rounded">{campaign.code}</span></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerCharacters.map((character, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src={character.image} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {character.name ? character.name.charAt(0).toUpperCase() : 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white">
                          {character.name || 'Unnamed Character'}
                        </h3>
                        <p className="text-sm text-blue-200">
                          Created: {new Date(character.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(character.data || {}).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-blue-200">{key}:</span>
                          <span className="text-white ml-2">{value?.toString() || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerManager;
