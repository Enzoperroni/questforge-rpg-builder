
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Upload, Users } from 'lucide-react';

const NPCManager = ({ campaign, updateCampaign }) => {
  const [newNPC, setNewNPC] = useState({
    name: '',
    description: '',
    image: '',
    stats: {}
  });
  const [editingNPC, setEditingNPC] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleImageUpload = (event, isEditing = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          if (isEditing && editingNPC) {
            setEditingNPC(prev => ({ ...prev, image: result }));
          } else {
            setNewNPC(prev => ({ ...prev, image: result }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addNPC = () => {
    if (newNPC.name.trim()) {
      const updatedCampaign = {
        ...campaign,
        npcs: [...(campaign.npcs || []), { ...newNPC, id: Date.now() }]
      };
      updateCampaign(updatedCampaign);
      setNewNPC({ name: '', description: '', image: '', stats: {} });
      setIsAddingNew(false);
    }
  };

  const updateNPC = () => {
    if (editingNPC && editingNPC.name.trim()) {
      const updatedCampaign = {
        ...campaign,
        npcs: campaign.npcs.map(npc => 
          npc.id === editingNPC.id ? editingNPC : npc
        )
      };
      updateCampaign(updatedCampaign);
      setEditingNPC(null);
    }
  };

  const deleteNPC = (npcId) => {
    const updatedCampaign = {
      ...campaign,
      npcs: campaign.npcs.filter(npc => npc.id !== npcId)
    };
    updateCampaign(updatedCampaign);
  };

  const npcs = campaign.npcs || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Users className="h-6 w-6 mr-2" />
              NPCs ({npcs.length})
            </CardTitle>
            <Button
              onClick={() => setIsAddingNew(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add NPC
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingNew && (
            <Card className="mb-6 bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Add New NPC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="NPC Name"
                      value={newNPC.name}
                      onChange={(e) => setNewNPC(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                    <Textarea
                      placeholder="Description"
                      value={newNPC.description}
                      onChange={(e) => setNewNPC(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={newNPC.image} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {newNPC.name ? newNPC.name.charAt(0).toUpperCase() : 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e)}
                          className="hidden"
                          id="npc-image-upload"
                        />
                        <label htmlFor="npc-image-upload">
                          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" asChild>
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addNPC} className="bg-green-600 hover:bg-green-700">
                    Add NPC
                  </Button>
                  <Button 
                    onClick={() => setIsAddingNew(false)} 
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {editingNPC && (
            <Card className="mb-6 bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Edit NPC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="NPC Name"
                      value={editingNPC.name}
                      onChange={(e) => setEditingNPC(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                    <Textarea
                      placeholder="Description"
                      value={editingNPC.description}
                      onChange={(e) => setEditingNPC(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={editingNPC.image} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {editingNPC.name ? editingNPC.name.charAt(0).toUpperCase() : 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                          id="edit-npc-image-upload"
                        />
                        <label htmlFor="edit-npc-image-upload">
                          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" asChild>
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={updateNPC} className="bg-blue-600 hover:bg-blue-700">
                    Update NPC
                  </Button>
                  <Button 
                    onClick={() => setEditingNPC(null)} 
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {npcs.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">No NPCs created yet.</p>
              <p className="text-sm text-blue-300 mt-2">Add NPCs to populate your campaign world.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {npcs.map((npc) => (
                <Card key={npc.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={npc.image} />
                          <AvatarFallback className="bg-purple-500 text-white">
                            {npc.name ? npc.name.charAt(0).toUpperCase() : 'N'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{npc.name}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNPC(npc)}
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNPC(npc.id)}
                          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {npc.description && (
                      <p className="text-sm text-blue-200 mb-2">{npc.description}</p>
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
