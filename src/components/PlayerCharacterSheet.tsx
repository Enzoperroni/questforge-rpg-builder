
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlayerCharacterSheet = ({ campaign, playerId }) => {
  const [character, setCharacter] = useState({
    name: '',
    data: {},
    image: '',
    createdAt: new Date().toISOString()
  });
  const { toast } = useToast();

  useEffect(() => {
    const characterKey = `character_${campaign.code}_${playerId}`;
    const savedCharacter = localStorage.getItem(characterKey);
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    }
  }, [campaign.code, playerId]);

  const handleFieldChange = (fieldId, value) => {
    setCharacter(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldId]: value
      }
    }));
  };

  const handleNameChange = (value) => {
    setCharacter(prev => ({
      ...prev,
      name: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCharacter(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCharacter = () => {
    const characterKey = `character_${campaign.code}_${playerId}`;
    localStorage.setItem(characterKey, JSON.stringify(character));
    
    toast({
      title: "Character Saved",
      description: "Your character sheet has been saved successfully",
    });
  };

  const renderField = (field) => {
    const value = character.data[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 min-h-20"
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => handleFieldChange(field.id, newValue)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="bg-white/20 border-white/30 text-white"
            />
            {character.image && (
              <div className="mt-2">
                <img src={character.image} alt="Character" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <User className="h-6 w-6 mr-2" />
            My Character Sheet
          </CardTitle>
          <Button onClick={saveCharacter} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Character
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={character.image} />
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                {character.name ? character.name.charAt(0).toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <Label>Character Name</Label>
              <Input
                value={character.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your character's name"
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 text-xl font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaign.characterSheetTemplate.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center">
                  {field.name}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerCharacterSheet;
