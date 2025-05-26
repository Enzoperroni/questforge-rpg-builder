
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Save, User } from 'lucide-react';

const PlayerCharacterSheet = ({ campaign, code }) => {
  const [character, setCharacter] = useState({
    name: '',
    data: {},
    image: '',
    createdAt: new Date().toISOString()
  });

  const characterKey = `character_${code}_${Date.now()}`;

  useEffect(() => {
    // Try to load existing character
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`character_${code}_`)) {
        const existingCharacter = JSON.parse(localStorage.getItem(key) || '{}');
        setCharacter(existingCharacter);
        break;
      }
    }
  }, [code]);

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
    localStorage.setItem(characterKey, JSON.stringify(character));
    console.log('Character saved:', character);
  };

  if (!campaign?.characterSheet?.fields) {
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
              {campaign.characterSheet.fields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    {field.name}
                  </label>
                  {field.type === 'text' && (
                    <Input
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    />
                  )}
                  {field.type === 'dropdown' && (
                    <select
                      value={character.data[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full h-10 rounded-md bg-white/20 border border-white/30 text-white px-3 py-2"
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
