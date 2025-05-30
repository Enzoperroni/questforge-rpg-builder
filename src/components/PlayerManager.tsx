
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {Users, Eye, Trash2, RotateCcw, X} from 'lucide-react';
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
  const [viewingFullPage, setViewingFullPage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerCharacters();
  }, [campaign.id]);

  const fetchPlayerCharacters = async () => {
    setPlayerCharacters([])
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
        <div className="whitespace-pre-wrap text-sm text-amber-200 max-h-32 overflow-y-auto">
          {value || 'Not set'}
        </div>
      );
    }
    return <span className="text-amber-200">{value || 'Not set'}</span>;
  };

  const renderFullPageView = () => {
    if (!selectedCharacter) return null;

    const isSingleTextarea = campaign.character_sheet_template?.length === 1 && 
                             campaign.character_sheet_template[0].type === 'textarea';

    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-0 tavern-card text-amber-100 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-amber-800/50">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedCharacter.image} />
                <AvatarFallback className="bg-amber-600 text-amber-100">
                  {selectedCharacter.name ? selectedCharacter.name.charAt(0).toUpperCase() : 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-amber-100">{selectedCharacter.name}</h2>
                <p className="text-amber-300">Player: {selectedCharacter.profiles?.username || 'Unknown'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setViewingFullPage(false)}
              className="tavern-button"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {isSingleTextarea ? (
              <div className="h-full">
                <div className="h-full tavern-card p-6">
                  <div className="whitespace-pre-wrap text-amber-200 h-full overflow-y-auto">
                    {selectedCharacter.data?.[campaign.character_sheet_template[0].id] || 'Not set'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {campaign.character_sheet_template?.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium text-amber-200">
                      {field.name}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="tavern-card p-3 min-h-[40px] flex items-start">
                      {renderFieldValue(field, selectedCharacter.data?.[field.id])}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const shouldShowFullPage = (character) => {
    const isSingleTextarea = campaign.character_sheet_template?.length === 1 && 
                             campaign.character_sheet_template[0].type === 'textarea';
    
    if (isSingleTextarea) {
      setSelectedCharacter(character);
      setViewingFullPage(true);
    } else {
      setSelectedCharacter(character);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="tavern-card text-amber-100">
          <CardHeader className={'flex flex-row items-center justify-between'}>
            <CardTitle className="text-xl">Player Characters</CardTitle>
            <Button
                variant="outline"
                size="sm"
                onClick={fetchPlayerCharacters}
                className="tavern-button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {playerCharacters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-200">No player characters created yet. Players will appear here once they create their characters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playerCharacters.map((character) => (
                  <div key={character.id} className="tavern-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={character.image} />
                        <AvatarFallback className="bg-amber-600 text-amber-100">
                          {character.name ? character.name.charAt(0).toUpperCase() : 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex space-x-2">
                        {campaign.character_sheet_template?.length === 1 && 
                         campaign.character_sheet_template[0].type === 'textarea' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shouldShowFullPage(character)}
                            className="tavern-button"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shouldShowFullPage(character)}
                                className="tavern-button"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="tavern-card text-amber-100 overflow-y-auto w-full max-w-none sm:max-w-none">
                              <SheetHeader>
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={character.image} />
                                    <AvatarFallback className="bg-amber-600 text-amber-100">
                                      {character.name ? character.name.charAt(0).toUpperCase() : 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <SheetTitle className="text-amber-100">{character.name}</SheetTitle>
                                    <SheetDescription className="text-amber-300">
                                      Player: {character.profiles?.username || 'Unknown'}
                                    </SheetDescription>
                                  </div>
                                </div>
                              </SheetHeader>
                              <div className="mt-6 space-y-4">
                                {campaign.character_sheet_template?.map((field) => (
                                  <div key={field.id} className="space-y-2">
                                    <label className="text-sm font-medium text-amber-200">
                                      {field.name}
                                      {field.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>
                                    <div className="tavern-card p-3 min-h-[40px] flex items-start">
                                      {renderFieldValue(field, character.data?.[field.id])}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCharacter(character.id)}
                          className="bg-red-800 hover:bg-red-700 border-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-amber-100">{character.name || 'Unnamed Character'}</h3>
                    <div className="text-sm text-amber-200">
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
      
      {viewingFullPage && renderFullPageView()}
    </>
  );
};

export default PlayerManager;
