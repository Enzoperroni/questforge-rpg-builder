
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Crown, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CreateCampaign = () => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignCode, setCampaignCode] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateCampaignCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign name",
        variant: "destructive"
      });
      return;
    }

    const code = generateCampaignCode();
    setCampaignCode(code);
    
    // Store campaign data in localStorage
    const campaignData = {
      name: campaignName,
      description: campaignDescription,
      code: code,
      createdAt: new Date().toISOString(),
      characterSheetTemplate: [],
      players: [],
      npcs: []
    };
    
    localStorage.setItem(`campaign_${code}`, JSON.stringify(campaignData));
    setIsCreated(true);

    toast({
      title: "Campaign Created!",
      description: `Your campaign code is ${code}`,
    });
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(campaignCode);
    toast({
      title: "Copied!",
      description: "Campaign code copied to clipboard",
    });
  };

  const goToCampaign = () => {
    navigate(`/master/${campaignCode}`);
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Campaign Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-blue-200 mb-4">Share this code with your players:</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="bg-white/20 px-4 py-2 rounded text-xl font-mono tracking-wider">
                  {campaignCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCodeToClipboard}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={goToCampaign}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="mr-2 h-5 w-5" />
                Enter Master View
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="Enter your campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="campaignDescription">Description (Optional)</Label>
            <Textarea
              id="campaignDescription"
              placeholder="Describe your campaign world..."
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 min-h-20"
            />
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCreateCampaign}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              Create Campaign
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCampaign;
