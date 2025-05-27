
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PlayerManager = ({ campaign, updateCampaign }) => {
  const [playerCharacters, setPlayerCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerCharacters();
  }, [campaign.id]);

  const fetchPlayerCharacters = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('campaign_id', campaign.id);

    if (error) {
      console.error('Error fetching characters:', error);
      toast({
        title: "Error",
        description: "Failed to load player characters",
        variant: "destructive"
      });
    } else {
      setPlayerCharacters(data || []);
    }
  };

  const removeCharacter = async (characterId) => {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove character",
        variant: "destructive"
      });
    } else {
      setPlayerCharacters(prev => prev.filter(char => char.id !== characterId));
      toast({
        title: "Character Removed",
        description: "Player character has been removed from the campaign",
      });
    }
  };

  const viewCharacter = (character) => {
    setSelectedCharacter(character);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === 'textarea') {
      return (
        <div className="whitespace-pre-wrap text-sm text-blue-200 max-h-32 overflow-y-auto">
          {value || 'Not set'}
        </div>
      );
    }
    return <span className="text-blue-200">{value || 'Not set'}</span>;
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
              {playerCharacters.map((character) => (
                <div key={character.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.image} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {character.name ? character.name.charAt(0).toUpperCase() : 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewCharacter(character)}
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-gray-900 border-gray-700 text-white overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle className="text-white">{character.name}</SheetTitle>
                            <SheetDescription className="text-gray-300">
                              Player: {character.profiles?.username || 'Unknown'}
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            {campaign.character_sheet_template?.map((field) => (
                              <div key={field.id} className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">
                                  {field.name}
                                  {field.required && <span className="text-red-400 ml-1">*</span>}
                                </label>
                                {renderFieldValue(field, character.data?.[field.id])}
                              </div>
                            ))}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCharacter(character.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{character.name || 'Unnamed Character'}</h3>
                  <div className="text-sm text-blue-200">
                    <p>Player: {character.profiles?.username || 'Unknown'}</p>
                    <p>Created: {new Date(character.created_at).toLocaleDateString()}</p>
                    {character.data && Object.keys(character.data).length > 0 && (
                      <p className="mt-1">Fields filled: {Object.keys(character.data).length}</p>
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
