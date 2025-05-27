
import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, Scroll, Users, Crown, FolderOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [campaignCode, setCampaignCode] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleJoinCampaign = async () => {
    if (campaignCode.trim()) {
      const { data } = await supabase
        .from('campaigns')
        .select('id')
        .eq('code', campaignCode)
        .single();
      
      if (data) {
        navigate(`/campaign/${campaignCode}`);
      } else {
        alert('Campaign not found! Please check your code.');
      }
    }
  };

  const handleAccessMasterView = async () => {
    if (masterCode.trim()) {
      const { data } = await supabase
        .from('campaigns')
        .select('id')
        .eq('code', masterCode)
        .eq('created_by', user?.id)
        .single();
      
      if (data) {
        navigate(`/master/${masterCode}`);
      } else {
        alert('Campaign not found or you are not the master! Please check your code.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-6">
              <Dice6 className="h-16 w-16 text-yellow-400 mr-4" />
              <h1 className="text-6xl font-bold text-white">RPG Creator</h1>
            </div>
            <p className="text-xl text-blue-200">Create epic campaigns, manage characters, and roll the dice of destiny</p>
          </div>
          
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

        <div className="grid md:grid-cols-3 gap-8">
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
              <FolderOpen className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Master Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-100 text-center">Access your existing campaign as Game Master using your campaign code.</p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Campaign Code"
                  value={masterCode}
                  onChange={(e) => setMasterCode(e.target.value.toUpperCase())}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                  maxLength={6}
                />
                <Button 
                  onClick={handleAccessMasterView}
                  disabled={!masterCode.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 disabled:opacity-50"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Access as Master
                </Button>
              </div>
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
              <span>Enhanced Dice Rolling</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
