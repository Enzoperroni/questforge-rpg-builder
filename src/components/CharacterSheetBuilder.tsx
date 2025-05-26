
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
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
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
      options: newField.type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };

    const updatedCampaign = {
      ...campaign,
      characterSheetTemplate: [...(campaign.characterSheetTemplate || []), field],
      templateLastUpdate: new Date().toISOString()
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
      characterSheetTemplate: (campaign.characterSheetTemplate || []).filter(field => field.id !== fieldId),
      templateLastUpdate: new Date().toISOString()
    };
    updateCampaign(updatedCampaign);
    
    toast({
      title: "Field Removed",
      description: "Field has been removed from the character sheet",
    });
  };

  const moveField = (fieldId, direction) => {
    const fields = [...(campaign.characterSheetTemplate || [])];
    const currentIndex = fields.findIndex(field => field.id === fieldId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < fields.length) {
      [fields[currentIndex], fields[newIndex]] = [fields[newIndex], fields[currentIndex]];
      
      const updatedCampaign = {
        ...campaign,
        characterSheetTemplate: fields,
        templateLastUpdate: new Date().toISOString()
      };
      updateCampaign(updatedCampaign);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Character Sheet Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Field Name</Label>
              <Input
                placeholder="e.g., Character Name"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Required</Label>
              <Select value={newField.required.toString()} onValueChange={(value) => setNewField({ ...newField, required: value === 'true' })}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Optional</SelectItem>
                  <SelectItem value="true">Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={addField} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Current Template Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaign.characterSheetTemplate || campaign.characterSheetTemplate.length === 0 ? (
            <p className="text-blue-200 text-center py-4">No fields added yet. Add fields above to build your character sheet template.</p>
          ) : (
            <div className="space-y-3">
              {campaign.characterSheetTemplate.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{field.name}</span>
                    <span className="text-sm text-blue-200">({field.type})</span>
                    {field.required && <span className="text-xs bg-red-500 px-2 py-1 rounded">Required</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(field.id)}
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
