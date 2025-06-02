
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Annotation {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PlayerAnnotationsManagerProps {
  campaign: any;
  userId: string | undefined;
}

const PlayerAnnotationsManager = ({ campaign, userId }: PlayerAnnotationsManagerProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAnnotation, setNewAnnotation] = useState({ title: '', content: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAnnotations();
    }
  }, [campaign.id, userId]);

  const fetchAnnotations = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('created_by', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching player annotations:', error);
        return;
      }

      setAnnotations(data || []);
    } catch (err) {
      console.error('Error in fetchAnnotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnotation = async () => {
    if (!newAnnotation.title.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('annotations')
        .insert({
          campaign_id: campaign.id,
          title: newAnnotation.title,
          content: newAnnotation.content,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating annotation:', error);
        return;
      }

      setAnnotations([data, ...annotations]);
      setNewAnnotation({ title: '', content: '' });
      setShowNewForm(false);
    } catch (err) {
      console.error('Error in createAnnotation:', err);
    }
  };

  const updateAnnotation = async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('annotations')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('created_by', userId);

      if (error) {
        console.error('Error updating annotation:', error);
        return;
      }

      setAnnotations(annotations.map(ann => 
        ann.id === id ? { ...ann, title, content, updated_at: new Date().toISOString() } : ann
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Error in updateAnnotation:', err);
    }
  };

  const deleteAnnotation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', id)
        .eq('created_by', userId);

      if (error) {
        console.error('Error deleting annotation:', error);
        return;
      }

      setAnnotations(annotations.filter(ann => ann.id !== id));
    } catch (err) {
      console.error('Error in deleteAnnotation:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-amber-100">Loading your notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-100">My Campaign Notes</h2>
        <Button
          onClick={() => setShowNewForm(true)}
          className="tavern-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {showNewForm && (
        <Card className="tavern-card">
          <CardHeader>
            <CardTitle className="text-amber-100">New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newAnnotation.title}
              onChange={(e) => setNewAnnotation({ ...newAnnotation, title: e.target.value })}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300"
            />
            <Textarea
              placeholder="Write your notes here..."
              value={newAnnotation.content}
              onChange={(e) => setNewAnnotation({ ...newAnnotation, content: e.target.value })}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300 min-h-[120px]"
            />
            <div className="flex space-x-2">
              <Button onClick={createAnnotation} className="tavern-button">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewAnnotation({ title: '', content: '' });
                }}
                className="tavern-button"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {annotations.length === 0 ? (
          <Card className="tavern-card">
            <CardContent className="text-center py-8">
              <p className="text-amber-200">No notes yet. Create your first note to get started!</p>
            </CardContent>
          </Card>
        ) : (
          annotations.map((annotation) => (
            <PlayerAnnotationCard
              key={annotation.id}
              annotation={annotation}
              isEditing={editingId === annotation.id}
              onEdit={() => setEditingId(annotation.id)}
              onSave={updateAnnotation}
              onCancel={() => setEditingId(null)}
              onDelete={deleteAnnotation}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface PlayerAnnotationCardProps {
  annotation: Annotation;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (id: string, title: string, content: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

const PlayerAnnotationCard = ({ annotation, isEditing, onEdit, onSave, onCancel, onDelete }: PlayerAnnotationCardProps) => {
  const [editTitle, setEditTitle] = useState(annotation.title);
  const [editContent, setEditContent] = useState(annotation.content);

  const handleSave = () => {
    if (editTitle.trim()) {
      onSave(annotation.id, editTitle, editContent);
    }
  };

  const handleCancel = () => {
    setEditTitle(annotation.title);
    setEditContent(annotation.content);
    onCancel();
  };

  return (
    <Card className="tavern-card">
      <CardHeader>
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="bg-amber-50/10 border-amber-700/30 text-amber-100"
          />
        ) : (
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-100">{annotation.title}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="tavern-button"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(annotation.id)}
                className="tavern-button hover:bg-red-700/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100 min-h-[120px]"
            />
            <div className="flex space-x-2">
              <Button onClick={handleSave} className="tavern-button">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="tavern-button"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-amber-200 whitespace-pre-wrap">{annotation.content}</p>
            <p className="text-amber-400 text-sm">
              Last updated: {new Date(annotation.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerAnnotationsManager;
