
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
    if (!campaignCode.trim()) return;

    console.log('Attempting to join campaign with code:', campaignCode.toUpperCase());

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, code, name')
        .eq('code', campaignCode.toUpperCase());

      console.log('Campaign query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        alert('Error searching for campaign: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Campaign not found! Please check your code.');
        return;
      }

      console.log('Found campaign, navigating to:', `/campaign/${campaignCode.toUpperCase()}`);
      navigate(`/campaign/${campaignCode.toUpperCase()}`);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      alert('An error occurred while joining the campaign.');
    }
  };

  const handleAccessMasterView = async () => {
    if (!masterCode.trim()) return;

    console.log('Attempting to access master view with code:', masterCode.toUpperCase());

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, code, name')
        .eq('code', masterCode.toUpperCase());

      console.log('Master campaign query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        alert('Error searching for campaign: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Campaign not found! Please check your code.');
        return;
      }

      console.log('Found campaign, navigating to master view:', `/master/${masterCode.toUpperCase()}`);
      navigate(`/master/${masterCode.toUpperCase()}`);
    } catch (err) {
      console.error('Error accessing master campaign:', err);
      alert('An error occurred while accessing the master campaign.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      alert('Failed to sign out.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-6">
              <Dice6 className="h-16 w-16 text-amber-400 mr-4" />
              <h1 className="text-6xl font-bold text-amber-100">RPG Creator</h1>
            </div>
            <p className="text-xl text-amber-200">
              Create epic campaigns, manage characters, and roll the dice of destiny
            </p>
          </div>

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

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="tavern-card text-amber-100">
            <CardHeader className="text-center">
              <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Game Master</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-200 text-center">
                Create and manage your campaign with full control over characters, NPCs, and game mechanics.
              </p>
              <Button
                onClick={handleCreateCampaign}
                className="w-full tavern-button"
              >
                <Scroll className="mr-2 h-5 w-5" />
                Create New Campaign
              </Button>
            </CardContent>
          </Card>

          <Card className="tavern-card text-amber-100">
            <CardHeader className="text-center">
              <FolderOpen className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Master Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-200 text-center">
                Access your existing campaign as Game Master using your campaign code.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Campaign Code"
                  value={masterCode}
                  onChange={(e) => setMasterCode(e.target.value.toUpperCase())}
                  className="tavern-input"
                  maxLength={6}
                />
                <Button
                  onClick={handleAccessMasterView}
                  disabled={!masterCode.trim()}
                  className="w-full tavern-button disabled:opacity-50"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Access as Master
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="tavern-card text-amber-100">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-2xl">Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-200 text-center">
                Join an existing campaign using your campaign code and create your character.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Campaign Code"
                  value={campaignCode}
                  onChange={(e) => setCampaignCode(e.target.value.toUpperCase())}
                  className="tavern-input"
                  maxLength={6}
                />
                <Button
                  onClick={handleJoinCampaign}
                  disabled={!campaignCode.trim()}
                  className="w-full tavern-button disabled:opacity-50"
                >
                  <Dice6 className="mr-2 h-5 w-5" />
                  Join Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-amber-200">
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
