
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save, X, Image, RefreshCw, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MediaPost {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface CampaignMediaManagerProps {
  campaign: any;
  userId: string | undefined;
}

const CampaignMediaManager = ({ campaign, userId }: CampaignMediaManagerProps) => {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', image_url: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchMediaPosts();
  }, [campaign.id]);

  const fetchMediaPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_media')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media posts:', error);
        return;
      }

      setMediaPosts(data || []);
    } catch (err) {
      console.error('Error in fetchMediaPosts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !userId) return null;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `campaign-media/${campaign.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setNewPost({ ...newPost, image_url: imageUrl });
    }
  };

  const createMediaPost = async () => {
    if (!newPost.title.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('campaign_media')
        .insert({
          campaign_id: campaign.id,
          title: newPost.title,
          content: newPost.content || null,
          image_url: newPost.image_url || null,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating media post:', error);
        return;
      }

      setMediaPosts([data, ...mediaPosts]);
      setNewPost({ title: '', content: '', image_url: '' });
      setShowNewForm(false);
    } catch (err) {
      console.error('Error in createMediaPost:', err);
    }
  };

  const updateMediaPost = async (id: string, title: string, content: string, image_url: string) => {
    try {
      const { error } = await supabase
        .from('campaign_media')
        .update({ 
          title, 
          content: content || null, 
          image_url: image_url || null, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating media post:', error);
        return;
      }

      setMediaPosts(mediaPosts.map(post => 
        post.id === id ? { 
          ...post, 
          title, 
          content: content || null, 
          image_url: image_url || null, 
          updated_at: new Date().toISOString() 
        } : post
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Error in updateMediaPost:', err);
    }
  };

  const deleteMediaPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaign_media')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media post:', error);
        return;
      }

      setMediaPosts(mediaPosts.filter(post => post.id !== id));
    } catch (err) {
      console.error('Error in deleteMediaPost:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-amber-100">Loading media posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-100">Campaign Media</h2>
        <div className="flex space-x-2">
          <Button
            onClick={fetchMediaPosts}
            variant="outline"
            className="tavern-button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowNewForm(true)}
            className="tavern-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {showNewForm && (
        <Card className="tavern-card">
          <CardHeader>
            <CardTitle className="text-amber-100">New Media Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300"
            />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-200 text-sm">
                <span>Add image:</span>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Image URL (optional)..."
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300 flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="tavern-button"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Textarea
              placeholder="Post content..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300 min-h-[120px]"
            />
            <div className="flex space-x-2">
              <Button onClick={createMediaPost} className="tavern-button">
                <Save className="h-4 w-4 mr-2" />
                Post
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewPost({ title: '', content: '', image_url: '' });
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
        {mediaPosts.length === 0 ? (
          <Card className="tavern-card">
            <CardContent className="text-center py-8">
              <p className="text-amber-200">No media posts yet. Create your first post to get started!</p>
            </CardContent>
          </Card>
        ) : (
          mediaPosts.map((post) => (
            <MediaPostCard
              key={post.id}
              post={post}
              isEditing={editingId === post.id}
              onEdit={() => setEditingId(post.id)}
              onSave={updateMediaPost}
              onCancel={() => setEditingId(null)}
              onDelete={deleteMediaPost}
              canEdit={true}
              onImageUpload={handleImageUpload}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface MediaPostCardProps {
  post: MediaPost;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (id: string, title: string, content: string, image_url: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  onImageUpload: (file: File) => Promise<string | null>;
}

const MediaPostCard = ({ post, isEditing, onEdit, onSave, onCancel, onDelete, canEdit, onImageUpload }: MediaPostCardProps) => {
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImageUrl, setEditImageUrl] = useState(post.image_url || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSave = () => {
    if (editTitle.trim()) {
      onSave(post.id, editTitle, editContent, editImageUrl);
    }
  };

  const handleCancel = () => {
    setEditTitle(post.title);
    setEditContent(post.content || '');
    setEditImageUrl(post.image_url || '');
    onCancel();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const imageUrl = await onImageUpload(file);
    if (imageUrl) {
      setEditImageUrl(imageUrl);
    }
    setUploadingImage(false);
  };

  return (
    <Card className="tavern-card">
      <CardHeader>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-amber-50/10 border-amber-700/30 text-amber-100"
            />
            <div className="flex space-x-2">
              <Input
                placeholder="Image URL (optional)..."
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="bg-amber-50/10 border-amber-700/30 text-amber-100 placeholder:text-amber-300 flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="tavern-button"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-100">{post.title}</CardTitle>
            {canEdit && (
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
                  onClick={() => onDelete(post.id)}
                  className="tavern-button hover:bg-red-700/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
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
              placeholder="Post content..."
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
          <div className="space-y-4">
            {post.image_url && (
              <div className="w-full">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full max-w-md rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {post.content && (
              <p className="text-amber-200 whitespace-pre-wrap">{post.content}</p>
            )}
            <p className="text-amber-400 text-sm">
              Posted: {new Date(post.created_at).toLocaleString()}
              {post.updated_at !== post.created_at && (
                <span> • Updated: {new Date(post.updated_at).toLocaleString()}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignMediaManager;
