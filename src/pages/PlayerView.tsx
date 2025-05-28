import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Dice6, Scroll, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import HorizontalCharacterSheet from '@/components/HorizontalCharacterSheet';
import DiceRollerEnhanced from '@/components/DiceRollerEnhanced';

const PlayerView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      fetchCampaignAndCharacter();
    }
  }, [code]);

  const fetchCampaignAndCharacter = async () => {
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (campaignError || !campaignData) {
      navigate('/');
      return;
    }

    setCampaign(campaignData);

    if (user) {
      const { data: characterData } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignData.id)
        .eq('user_id', user.id)
        .single();

      if (characterData) {
        setCharacter(characterData);
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Campaign not found</div>
      </div>
    );
  }

  if (!campaign.character_sheet_template || campaign.character_sheet_template.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="text-center">
            <Scroll className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Character Sheet Not Ready</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-blue-200">The Game Master hasn't set up the character sheet template yet. Please check back later.</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Back to Home
              </Button>
              {user && (
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
              <p className="text-blue-200">Player View</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Leave Campaign
            </Button>
            {user && (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="character" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="character" className="data-[state=active]:bg-white/20">
              <User className="h-4 w-4 mr-2" />
              My Character
            </TabsTrigger>
            <TabsTrigger value="dice" className="data-[state=active]:bg-white/20">
              <Dice6 className="h-4 w-4 mr-2" />
              Dice Roller
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character">
            <HorizontalCharacterSheet
              campaignId={campaign.id}
              userId={user?.id}
              template={campaign.character_sheet_template}
              existingCharacter={character}
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
