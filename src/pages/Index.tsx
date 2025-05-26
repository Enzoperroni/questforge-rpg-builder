
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, Scroll, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [campaignCode, setCampaignCode] = useState('');
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleJoinCampaign = () => {
    if (campaignCode.trim()) {
      navigate(`/campaign/${campaignCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Dice6 className="h-16 w-16 text-yellow-400 mr-4" />
            <h1 className="text-6xl font-bold text-white">RPG Creator</h1>
          </div>
          <p className="text-xl text-blue-200">Create epic campaigns, manage characters, and roll the dice of destiny</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Game Master</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-100 text-center">Create and manage your campaign with full control over characters, NPCs, and game mechanics.</p>
              <Button 
                onClick={handleCreateCampaign}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
              >
                <Scroll className="mr-2 h-5 w-5" />
                Create New Campaign
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-100 text-center">Join an existing campaign using your campaign code and create your character.</p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Campaign Code"
                  value={campaignCode}
                  onChange={(e) => setCampaignCode(e.target.value.toUpperCase())}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                  maxLength={6}
                />
                <Button 
                  onClick={handleJoinCampaign}
                  disabled={!campaignCode.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 disabled:opacity-50"
                >
                  <Dice6 className="mr-2 h-5 w-5" />
                  Join Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-blue-200">
            <div className="flex items-center">
              <Scroll className="h-6 w-6 mr-2" />
              <span>Custom Character Sheets</span>
            </div>
            <div className="flex items-center">
              <Dice6 className="h-6 w-6 mr-2" />
              <span>Dice Rolling System</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span>Player Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
