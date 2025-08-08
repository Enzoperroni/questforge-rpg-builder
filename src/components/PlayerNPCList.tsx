import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NPC {
  id: string;
  name: string;
  image: string | null;
  data: Record<string, unknown> | null;
}

interface PlayerNPCListProps {
  campaign: { id: string };
}

const PlayerNPCList = ({ campaign }: PlayerNPCListProps) => {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNPCs = async () => {
      try {
        const { data, error } = await supabase
          .from('npcs')
          .select('*')
          .eq('campaign_id', campaign.id)
          .order('created_at');

        if (error) {
          console.error('Error fetching NPCs:', error);
          return;
        }

        setNpcs(data as NPC[] || []);
      } catch (err) {
        console.error('Error in fetchNPCs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNPCs();
  }, [campaign.id]);

  return (
    <Card className="tavern-card text-amber-100">
      <CardHeader>
        <CardTitle className="text-xl text-amber-100">NPCs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-amber-200">Loading NPCs...</p>
          </div>
        ) : npcs.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <p className="text-amber-200">No NPCs available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {npcs.map((npc) => (
              <div key={npc.id} className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={npc.image} />
                  <AvatarFallback className="bg-amber-600 text-amber-100 text-xl">
                    {npc.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-amber-100">{npc.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerNPCList;
