
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Save, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlayerCharacterSheet = ({ campaign, code }) => {
  const [character, setCharacter] = useState({
    name: '',
    data: {},
    image: '',
    createdAt: new Date().toISOString(),
    lastTemplateUpdate: null
  });
  const [hasNotification, setHasNotification] = useState(false);
  const { toast } = useToast();

  const characterKey = `character_${code}_${Date.now()}`;

  useEffect(() => {
    // Try to load existing character
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`character_${code}_`)) {
        const existingCharacter = JSON.parse(localStorage.getItem(key) || '{}');
        setCharacter(existingCharacter);
        
        // Check if template was updated after character creation
        const templateLastUpdate = campaign.templateLastUpdate;
        const characterLastUpdate = existingCharacter.lastTemplateUpdate;
        
        if (templateLastUpdate && (!characterLastUpdate || new Date(templateLastUpdate) > new Date(characterLastUpdate))) {
          setHasNotification(true);
          toast({
            title: "Character Sheet Updated",
            description: "The Game Master has updated the character sheet template. Please review your character.",
            variant: "default"
          });
        }
        break;
      }
    }
  }, [code, campaign.templateLastUpdate]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setCharacter(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setCharacter(prev => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value }
    }));
  };

  const saveCharacter = () => {
    const updatedCharacter = {
      ...character,
      lastTemplateUpdate: campaign.templateLastUpdate || new Date().toISOString()
    };
    
    // Find existing character key or use new one
    let saveKey = characterKey;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`character_${code}_`)) {
        saveKey = key;
        break;
      }
    }
    
    localStorage.setItem(saveKey, JSON.stringify(updatedCharacter));
    setCharacter(updatedCharacter);
    setHasNotification(false);
    
    toast({
      title: "Character Saved",
      description: "Your character sheet has been saved successfully.",
    });
  };

  const dismissNotification = () => {
    setHasNotification(false);
    const updatedCharacter = {
      ...character,
      lastTemplateUpdate: campaign.templateLastUpdate || new Date().toISOString()
    };
    setCharacter(updatedCharacter);
  };

  if (!campaign?.characterSheetTemplate || campaign.characterSheetTemplate.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Character Sheet Template</h2>
            <p className="text-blue-200">The Game Master hasn't created a character sheet template yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {hasNotification && (
          <Card className="bg-orange-500/20 backdrop-blur-md border-orange-400/30 text-white mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                  <div>
                    <h3 className="font-semibold">Character Sheet Updated</h3>
                    <p className="text-sm text-orange-200">The Game Master has made changes to the character sheet template.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissNotification}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Character Sheet - {campaign.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Character Image and Name */}
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={character.image} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {character.name ? character.name.charAt(0).toUpperCase() : 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="character-image-upload"
                  />
                  <label htmlFor="character-image-upload">
                    <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-blue-200 mb-2">Character Name</label>
                <Input
                  placeholder="Enter character name"
                  value={character.name}
                  onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                />
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.characterSheetTemplate.map((field, index) => (
                <div key={field.id || index} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    {field.name}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.type === 'text' && (
                    <Input
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                      required={field.required}
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                      required={field.required}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 min-h-[100px]"
                      required={field.required}
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full h-10 rounded-md bg-white/20 border border-white/30 text-white px-3 py-2"
                      required={field.required}
                    >
                      <option value="">Select {field.name}</option>
                      {field.options?.map((option, optIndex) => (
                        <option key={optIndex} value={option} className="text-black">
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button onClick={saveCharacter} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Character
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerCharacterSheet;
