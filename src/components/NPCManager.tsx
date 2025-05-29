
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, Upload, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NPCManager = ({ campaign, updateCampaign }) => {
  const [newNPC, setNewNPC] = useState({
    name: '',
    description: '',
    image: ''
  });
  const { toast } = useToast();

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setNewNPC(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addNPC = () => {
    if (!newNPC.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an NPC name",
        variant: "destructive"
      });
      return;
    }

    const npc = {
      id: Date.now().toString(),
      ...newNPC,
      createdAt: new Date().toISOString()
    };

    const updatedCampaign = {
      ...campaign,
      npcs: [...(campaign.npcs || []), npc]
    };

    updateCampaign(updatedCampaign);
    setNewNPC({ name: '', description: '', image: '' });
    
    toast({
      title: "NPC Added",
      description: `${npc.name} has been added to the campaign`,
    });
  };

  const removeNPC = (npcId) => {
    const updatedCampaign = {
      ...campaign,
      npcs: (campaign.npcs || []).filter(npc => npc.id !== npcId)
    };
    updateCampaign(updatedCampaign);
    
    toast({
      title: "NPC Removed",
      description: "NPC has been removed from the campaign",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <CardTitle className="text-xl text-amber-100">Add New NPC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={newNPC.image} />
                <AvatarFallback className="bg-amber-600 text-amber-100 text-xl">
                  {newNPC.name ? newNPC.name.charAt(0).toUpperCase() : 'N'}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="npc-image-upload"
                />
                <label htmlFor="npc-image-upload">
                  <Button variant="outline" size="sm" className="tavern-button" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Image
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <Input
                placeholder="NPC Name"
                value={newNPC.name}
                onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                className="tavern-input"
              />
              <Textarea
                placeholder="NPC Description"
                value={newNPC.description}
                onChange={(e) => setNewNPC({ ...newNPC, description: e.target.value })}
                className="tavern-input"
              />
              <Button onClick={addNPC} className="tavern-button">
                <Plus className="h-4 w-4 mr-2" />
                Add NPC
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <CardTitle className="text-xl text-amber-100">Campaign NPCs</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaign.npcs || campaign.npcs.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-200">No NPCs created yet. Add NPCs above to populate your campaign.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaign.npcs.map((npc) => (
                <div key={npc.id} className="tavern-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={npc.image} />
                      <AvatarFallback className="bg-amber-600 text-amber-100">
                        {npc.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeNPC(npc.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-amber-100">{npc.name}</h3>
                  {npc.description && (
                    <p className="text-sm text-amber-200">{npc.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NPCManager;
