
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NPCManager = ({ campaign, updateCampaign }) => {
  const [newNPC, setNewNPC] = useState({ name: '', description: '', image: '' });
  const [editingNPC, setEditingNPC] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
      name: newNPC.name,
      description: newNPC.description,
      image: newNPC.image,
      createdAt: new Date().toISOString()
    };

    const updatedCampaign = {
      ...campaign,
      npcs: [...(campaign.npcs || []), npc]
    };

    updateCampaign(updatedCampaign);
    setNewNPC({ name: '', description: '', image: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "NPC Added",
      description: `${npc.name} has been added to your campaign`,
    });
  };

  const updateNPC = () => {
    if (!editingNPC.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an NPC name",
        variant: "destructive"
      });
      return;
    }

    const updatedCampaign = {
      ...campaign,
      npcs: campaign.npcs.map(npc => 
        npc.id === editingNPC.id ? editingNPC : npc
      )
    };

    updateCampaign(updatedCampaign);
    setEditingNPC(null);
    
    toast({
      title: "NPC Updated",
      description: `${editingNPC.name} has been updated`,
    });
  };

  const deleteNPC = (npcId) => {
    const updatedCampaign = {
      ...campaign,
      npcs: campaign.npcs.filter(npc => npc.id !== npcId)
    };

    updateCampaign(updatedCampaign);
    
    toast({
      title: "NPC Deleted",
      description: "NPC has been removed from your campaign",
    });
  };

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        if (isEditing) {
          setEditingNPC({ ...editingNPC, image: imageUrl });
        } else {
          setNewNPC({ ...newNPC, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Users className="h-6 w-6 mr-2" />
            NPCs ({campaign.npcs?.length || 0})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add NPC
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New NPC</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="NPC Name"
                    value={newNPC.name}
                    onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe this NPC..."
                    value={newNPC.description}
                    onChange={(e) => setNewNPC({ ...newNPC, description: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  {newNPC.image && (
                    <div className="mt-2">
                      <img src={newNPC.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
                
                <Button onClick={addNPC} className="w-full bg-green-600 hover:bg-green-700">
                  Add NPC
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {!campaign.npcs || campaign.npcs.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">No NPCs created yet.</p>
              <p className="text-sm text-blue-300 mt-2">Add NPCs to populate your campaign world.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaign.npcs.map((npc) => (
                <Card key={npc.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={npc.image} />
                          <AvatarFallback className="bg-purple-500 text-white">
                            {npc.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{npc.name}</h3>
                          <p className="text-sm text-blue-200">
                            Created: {new Date(npc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingNPC(npc)}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700 text-white">
                            <DialogHeader>
                              <DialogTitle>Edit NPC</DialogTitle>
                            </DialogHeader>
                            {editingNPC && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    placeholder="NPC Name"
                                    value={editingNPC.name}
                                    onChange={(e) => setEditingNPC({ ...editingNPC, name: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    placeholder="Describe this NPC..."
                                    value={editingNPC.description}
                                    onChange={(e) => setEditingNPC({ ...editingNPC, description: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Image</Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                  {editingNPC.image && (
                                    <div className="mt-2">
                                      <img src={editingNPC.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                                    </div>
                                  )}
                                </div>
                                
                                <Button onClick={updateNPC} className="w-full bg-blue-600 hover:bg-blue-700">
                                  Update NPC
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteNPC(npc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {npc.description && (
                      <p className="text-sm text-blue-200 mt-2">{npc.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NPCManager;
