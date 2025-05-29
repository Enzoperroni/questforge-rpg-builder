
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

interface VerticalCharacterSheetProps {
  campaignId: string;
  userId: string;
  template: Field[];
  existingCharacter?: any;
}

const VerticalCharacterSheet = ({ 
  campaignId, 
  userId, 
  template, 
  existingCharacter 
}: VerticalCharacterSheetProps) => {
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-amber-200">{field.name}</label>
          <div className="tavern-card px-3 py-2 text-amber-100 min-h-[40px] flex items-center">
            {field.type === 'checkbox' ? (
              value ? 'Yes' : 'No'
            ) : field.type === 'textarea' ? (
              <div className="whitespace-pre-wrap w-full">{value?.toString() || '-'}</div>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">{field.name}</label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="tavern-input"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">{field.name}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              className="tavern-input"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-sm font-medium text-amber-200">{field.name}</label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="tavern-input flex-1 min-h-[200px] resize-none"
              style={{ height: 'calc(100vh - 300px)' }}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">{field.name}</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                className="border-amber-700 data-[state=checked]:bg-amber-600"
              />
              <span className="text-amber-100">{value ? 'Yes' : 'No'}</span>
            </div>
          </div>
        );

      case 'point_allocation':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-200">{field.name}</label>
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

  // Check if we have a single textarea field that should fill the page
  const isSingleTextarea = template.length === 1 && template[0].type === 'textarea';

  return (
    <Card className={`tavern-card text-amber-100 ${isSingleTextarea ? 'h-[calc(100vh-200px)] flex flex-col' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
        <div className="flex-1">
          <CardTitle className="text-2xl">
            {isEditing ? (
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Character Name"
                className="tavern-input text-2xl font-bold"
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
              className="tavern-button"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <Button
              onClick={saveCharacter}
              disabled={saving}
              className="tavern-button"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`${isSingleTextarea ? 'flex-1 flex flex-col' : ''}`}>
        <div className={`${isSingleTextarea ? 'flex flex-col h-full' : 'grid grid-cols-1 gap-6'}`}>
          {template.map((field) => (
            <div key={field.id} className={field.type === 'textarea' && isSingleTextarea ? 'flex-1 flex flex-col' : ''}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalCharacterSheet;
