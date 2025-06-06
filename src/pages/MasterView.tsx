import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, Settings, Dice6, Plus, LogOut, FileText, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CharacterSheetBuilder from '@/components/CharacterSheetBuilder';
import PlayerManager from '@/components/PlayerManager';
import NPCManager from '@/components/NPCManager';
import DiceRollerMaster from '@/components/DiceRollerMaster';
import AnnotationsManager from '@/components/AnnotationsManager';
import CampaignMediaManager from '@/components/CampaignMediaManager';

const MasterView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);

  useEffect(() => {
    if (code) {
      fetchCampaign();
    }
  }, [code]);

  const fetchCampaign = async () => {
    setLoadingCampaign(true);
    console.log('Fetching campaign with code:', code?.toUpperCase());

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('code', code?.toUpperCase());

      console.log('Master view campaign query result:', { data, error });

      if (error) {
        console.error('Supabase error in master view:', error);
        alert('Error loading campaign: ' + error.message);
        navigate('/');
        return;
      }

      if (!data || data.length === 0) {
        alert('Campaign not found.');
        navigate('/');
        return;
      }

      console.log('Campaign loaded successfully:', data[0]);
      setCampaign(data[0]);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      alert('An error occurred while loading the campaign.');
      navigate('/');
    } finally {
      setLoadingCampaign(false);
    }
  };

  const updateCampaign = async (updatedCampaign) => {
    if (!campaign?.id) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update(updatedCampaign)
        .eq('id', campaign.id);

      if (!error) {
        setCampaign(updatedCampaign);
      } else {
        console.error('Error updating campaign:', error);
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Failed to sign out:', err);
      alert('Failed to sign out.');
    }
  };

  if (loading || loadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-100 text-xl font-semibold">Loading...</div>
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Crown className="h-8 w-8 text-amber-400" />
            <div>
              <h1 className="text-3xl font-bold text-amber-100">{campaign.name}</h1>
              <p className="text-amber-300">Campaign Code: {campaign.code}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="tavern-button"
            >
              Exit Campaign
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

        <Tabs defaultValue="sheet-builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 tavern-card">
            <TabsTrigger value="sheet-builder" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <Settings className="h-4 w-4 mr-2" />
              Sheet Builder
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="npcs" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <Plus className="h-4 w-4 mr-2" />
              NPCs
            </TabsTrigger>
            <TabsTrigger value="annotations" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <FileText className="h-4 w-4 mr-2" />
              Annotations
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <Image className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="dice" className="data-[state=active]:bg-amber-700/50 data-[state=active]:text-amber-100 text-amber-200">
              <Dice6 className="h-4 w-4 mr-2" />
              Dice Roller
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sheet-builder">
            <CharacterSheetBuilder campaign={campaign} updateCampaign={updateCampaign} />
          </TabsContent>

          <TabsContent value="players">
            <PlayerManager campaign={campaign} updateCampaign={updateCampaign} />
          </TabsContent>

          <TabsContent value="npcs">
            <NPCManager campaign={campaign} updateCampaign={updateCampaign} />
          </TabsContent>

          <TabsContent value="annotations">
            <AnnotationsManager campaign={campaign} />
          </TabsContent>

          <TabsContent value="media">
            <CampaignMediaManager campaign={campaign} userId={user?.id} />
          </TabsContent>

          <TabsContent value="dice">
            <DiceRollerMaster
              campaignId={campaign.id}
              userId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterView;
