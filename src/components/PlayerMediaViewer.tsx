
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MediaPost {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PlayerMediaViewerProps {
  campaign: any;
}

const PlayerMediaViewer = ({ campaign }: PlayerMediaViewerProps) => {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-amber-100">Loading campaign media...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-100">Campaign Media</h2>
        <Button
          onClick={fetchMediaPosts}
          variant="outline"
          className="tavern-button"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {mediaPosts.length === 0 ? (
          <Card className="tavern-card">
            <CardContent className="text-center py-8">
              <Image className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-200">No media posts yet. The Game Master hasn't shared any media.</p>
            </CardContent>
          </Card>
        ) : (
          mediaPosts.map((post) => (
            <Card key={post.id} className="tavern-card">
              <CardHeader>
                <CardTitle className="text-amber-100">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerMediaViewer;
