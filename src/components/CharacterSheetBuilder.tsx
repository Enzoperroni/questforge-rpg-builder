
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CharacterSheetBuilder = ({ campaign, updateCampaign }) => {
  const [newField, setNewField] = useState({ name: '', type: 'text', required: false });
  const { toast } = useToast();

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Big Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'points', label: 'Point Allocation' },
  ];

  const addField = () => {
    if (!newField.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a field name",
        variant: "destructive"
      });
      return;
    }

    const field = {
      id: Date.now().toString(),
      name: newField.name,
      type: newField.type,
      required: newField.required,
      options: newField.type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      defaultValue: newField.type === 'points' ? 10 : undefined
    };

    const updatedCampaign = {
      ...campaign,
      character_sheet_template: [...(campaign.character_sheet_template || []), field],
      template_last_update: new Date().toISOString()
    };

    updateCampaign(updatedCampaign);
    setNewField({ name: '', type: 'text', required: false });
    
    toast({
      title: "Field Added",
      description: `${field.name} has been added to the character sheet`,
    });
  };

  const removeField = (fieldId) => {
    const updatedCampaign = {
      ...campaign,
      character_sheet_template: (campaign.character_sheet_template || []).filter(field => field.id !== fieldId),
      template_last_update: new Date().toISOString()
    };
    updateCampaign(updatedCampaign);
    
    toast({
      title: "Field Removed",
      description: "Field has been removed from the character sheet",
    });
  };

  const moveField = (fieldId, direction) => {
    const fields = [...(campaign.character_sheet_template || [])];
    const currentIndex = fields.findIndex(field => field.id === fieldId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < fields.length) {
      [fields[currentIndex], fields[newIndex]] = [fields[newIndex], fields[currentIndex]];
      
      const updatedCampaign = {
        ...campaign,
        character_sheet_template: fields,
        template_last_update: new Date().toISOString()
      };
      updateCampaign(updatedCampaign);
    }
  };

  const getFieldTypeLabel = (type) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.label : type;
  };

  return (
    <div className="space-y-6">
      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <CardTitle className="text-xl text-amber-100">Character Sheet Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-amber-200">Field Name</Label>
              <Input
                placeholder="e.g., Character Name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="tavern-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-amber-200">Field Type</Label>
              <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                <SelectTrigger className="tavern-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tavern-card border-amber-800/50">
                  {fieldTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-amber-100 hover:bg-amber-700/30">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-amber-200">Required</Label>
              <Select value={newField.required.toString()} onValueChange={(value) => setNewField({ ...newField, required: value === 'true' })}>
                <SelectTrigger className="tavern-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tavern-card border-amber-800/50">
                  <SelectItem value="false" className="text-amber-100 hover:bg-amber-700/30">Optional</SelectItem>
                  <SelectItem value="true" className="text-amber-100 hover:bg-amber-700/30">Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={addField} className="w-full tavern-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="tavern-card text-amber-100">
        <CardHeader>
          <CardTitle className="text-xl text-amber-100">Current Template Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaign.character_sheet_template || campaign.character_sheet_template.length === 0 ? (
            <p className="text-amber-200 text-center py-4">No fields added yet. Add fields above to build your character sheet template.</p>
          ) : (
            <div className="space-y-3">
              {campaign.character_sheet_template.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 tavern-card">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-amber-100">{field.name}</span>
                    <span className="text-sm text-amber-200">({getFieldTypeLabel(field.type)})</span>
                    {field.required && <span className="text-xs bg-red-500 px-2 py-1 rounded">Required</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="tavern-button"
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterSheetBuilder;
