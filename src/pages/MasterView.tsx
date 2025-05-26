
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, Settings, Dice6, Plus } from 'lucide-react';
import CharacterSheetBuilder from '@/components/CharacterSheetBuilder';
import PlayerManager from '@/components/PlayerManager';
import NPCManager from '@/components/NPCManager';
import DiceRoller from '@/components/DiceRoller';

const MasterView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    const campaignData = localStorage.getItem(`campaign_${code}`);
    if (campaignData) {
      setCampaign(JSON.parse(campaignData));
    } else {
      navigate('/');
    }
  }, [code, navigate]);

  const updateCampaign = (updatedCampaign) => {
    localStorage.setItem(`campaign_${code}`, JSON.stringify(updatedCampaign));
    setCampaign(updatedCampaign);
  };

  if (!campaign) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Crown className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
              <p className="text-blue-200">Campaign Code: {campaign.code}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Exit Campaign
          </Button>
        </div>

        <Tabs defaultValue="sheet-builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="sheet-builder" className="data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Sheet Builder
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="npcs" className="data-[state=active]:bg-white/20">
              <Plus className="h-4 w-4 mr-2" />
              NPCs
            </TabsTrigger>
            <TabsTrigger value="dice" className="data-[state=active]:bg-white/20">
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

          <TabsContent value="dice">
            <DiceRoller />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterView;
