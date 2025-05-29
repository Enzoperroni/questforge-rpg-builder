import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Dice6, Scroll, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import VerticalCharacterSheet from '@/components/VerticalCharacterSheet';
import DiceRollerEnhanced from '@/components/DiceRollerEnhanced';

const PlayerView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('character');
  const [isCharacterEditing, setIsCharacterEditing] = useState(false);

  useEffect(() => {
    if (code) {
      fetchCampaignAndCharacter();
    }
  }, [code, user]);

  const fetchCampaignAndCharacter = async () => {
    console.log('Fetching campaign and character with code:', code?.toUpperCase());

    try {
      const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('code', code?.toUpperCase());

      console.log('Player view campaign query result:', { data: campaignData, error: campaignError });

      if (campaignError) {
        console.error('Supabase error in player view:', campaignError);
        alert('Error loading campaign: ' + campaignError.message);
        navigate('/');
        return;
      }

      if (!campaignData || campaignData.length === 0) {
        alert('Campaign not found.');
        navigate('/');
        return;
      }

      console.log('Campaign loaded successfully:', campaignData[0]);
      setCampaign(campaignData[0]);

      if (user) {
        const { data: characterData } = await supabase
            .from('characters')
            .select('*')
            .eq('campaign_id', campaignData[0].id)
            .eq('user_id', user.id)
            .single();

        if (characterData) {
          setCharacter(characterData);
        }
      }
    } catch (err) {
      console.error('Error in fetchCampaignAndCharacter:', err);
      alert('An error occurred while loading the campaign.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-amber-100 text-xl font-semibold">Loading campaign...</div>
        </div>
    );
  }

  if (!campaign) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-amber-100 text-xl font-semibold">Campaign not found</div>
        </div>
    );
  }

  if (!campaign.character_sheet_template || campaign.character_sheet_template.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md tavern-card text-amber-100">
            <CardHeader className="text-center">
              <Scroll className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Character Sheet Not Ready</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-amber-200">The Game Master hasn't set up the character sheet template yet. Please check back later.</p>
              <div className="flex space-x-2">
                <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="tavern-button"
                >
                  Back to Home
                </Button>
                {user && (
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="tavern-button"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Check if we have a single textarea field that should fill the page
  const isSingleTextarea = campaign.character_sheet_template.length === 1 &&
      campaign.character_sheet_template[0].type === 'textarea';

  // Only apply special layout for character tab when not editing and is single textarea
  const shouldUseFullPageLayout = activeTab === 'character' && !isCharacterEditing && isSingleTextarea;

  return (
      <div className="h-screen">
        <div className={`container mx-auto p-6 ${shouldUseFullPageLayout ? 'h-screen flex flex-col' : ''}`}>
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-amber-400" />
              <div>
                <h1 className="text-3xl font-bold text-amber-100">{campaign.name}</h1>
                <p className="text-amber-300">Player View</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="tavern-button"
              >
                Leave Campaign
              </Button>
              {user && (
                  <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="tavern-button"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className={`space-y-6 ${shouldUseFullPageLayout ? 'flex-1 flex flex-col' : ''}`}>
            <TabsList className="grid w-full grid-cols-2 tavern-card flex-shrink-0">
              <TabsTrigger value="character" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
                <User className="h-4 w-4 mr-2" />
                My Character
              </TabsTrigger>
              <TabsTrigger value="dice" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
                <Dice6 className="h-4 w-4 mr-2" />
                Dice Roller
              </TabsTrigger>
            </TabsList>

            <TabsContent value="character" className={shouldUseFullPageLayout ? 'flex-1 flex flex-col' : ''}>
              <VerticalCharacterSheet
                  campaignId={campaign.id}
                  userId={user?.id}
                  template={campaign.character_sheet_template}
                  existingCharacter={character}
                  onEditingChange={setIsCharacterEditing}
              />
            </TabsContent>

            <TabsContent value="dice">
              <DiceRollerEnhanced
                  campaignId={campaign.id}
                  isMaster={false}
                  userId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default PlayerView;
