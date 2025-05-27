
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Edit } from 'lucide-react';
import PointAllocationField from './PointAllocationField';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'point_allocation';
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface HorizontalCharacterSheetProps {
  campaignId: string;
  userId: string;
  template: Field[];
  existingCharacter?: any;
}

const HorizontalCharacterSheet = ({ 
  campaignId, 
  userId, 
  template, 
  existingCharacter 
}: HorizontalCharacterSheetProps) => {
  const [characterData, setCharacterData] = useState<Record<string, any>>({});
  const [characterName, setCharacterName] = useState('');
  const [isEditing, setIsEditing] = useState(!existingCharacter);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (existingCharacter) {
      setCharacterData(existingCharacter.data || {});
      setCharacterName(existingCharacter.name || '');
    }
  }, [existingCharacter]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setCharacterData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const saveCharacter = async () => {
    if (!characterName.trim()) {
      toast({
        title: "Error",
        description: "Character name is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      if (existingCharacter) {
        const { error } = await supabase
          .from('characters')
          .update({
            name: characterName,
            data: characterData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCharacter.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('characters')
          .insert({
            campaign_id: campaignId,
            user_id: userId,
            name: characterName,
            data: characterData
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Character saved successfully!"
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character",
        variant: "destructive"
      });
    }

    setSaving(false);
  };

  const renderField = (field: Field) => {
    const value = characterData[field.id] || '';

    if (!isEditing) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-blue-200">{field.name}</label>
          <div className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white min-h-[40px] flex items-center">
            {field.type === 'checkbox' ? (
              value ? 'Yes' : 'No'
            ) : (
              value?.toString() || '-'
            )}
          </div>
        </div>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">{field.name}</label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">{field.name}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              className="bg-white/20 border-white/30 text-white"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">{field.name}</label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 min-h-[80px]"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">{field.name}</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <span className="text-white">{value ? 'Yes' : 'No'}</span>
            </div>
          </div>
        );

      case 'point_allocation':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">{field.name}</label>
            <PointAllocationField
              value={value || field.min || 0}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              min={field.min || 0}
              max={field.max || 100}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">
            {isEditing ? (
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Character Name"
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 text-2xl font-bold"
              />
            ) : (
              characterName || 'Unnamed Character'
            )}
          </CardTitle>
        </div>
        <div className="flex space-x-2">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <Button
              onClick={saveCharacter}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {template.map((field) => (
            <div key={field.id}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HorizontalCharacterSheet;
