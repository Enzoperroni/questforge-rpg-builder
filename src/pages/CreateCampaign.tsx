import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Crown, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateCampaign = () => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignCode, setCampaignCode] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateCampaignCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a campanha.",
        variant: "destructive"
      });
      return;
    }

    // Obter usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o usuário autenticado.",
        variant: "destructive"
      });
      return;
    }

    const code = generateCampaignCode();
    setCampaignCode(code);

    const now = new Date().toISOString();

    const campaignData = {
      name: campaignName,
      code,
      character_sheet_template: [],
      template_last_update: now,
      created_by: user.id,
      created_at: now,
      updated_at: now
    };

    localStorage.setItem(`campaign_${code}`, JSON.stringify(campaignData));

    const { error } = await supabase
      .from('campaigns')
      .insert([campaignData]);

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar a campanha no Supabase.",
        variant: "destructive"
      });
      console.error("Erro no Supabase:", error);
      return;
    }

    setIsCreated(true);

    toast({
      title: "Campanha Criada!",
      description: `O código da sua campanha é ${code}`,
    });
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(campaignCode);
    toast({
      title: "Copiado!",
      description: "Código da campanha copiado para a área de transferência.",
    });
  };

  const goToCampaign = () => {
    navigate(`/master/${campaignCode}`);
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Campanha Criada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-blue-200 mb-4">Compartilhe este código com seus jogadores:</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="bg-white/20 px-4 py-2 rounded text-xl font-mono tracking-wider">
                  {campaignCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCodeToClipboard}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={goToCampaign}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="mr-2 h-5 w-5" />
                Entrar como Mestre
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Voltar para o Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Nova Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name" className="text-white">
              Nome da Campanha
            </Label>
            <Input
              id="campaign-name"
              placeholder="Digite o nome da campanha"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description" className="text-white">
              Descrição (opcional)
            </Label>
            <Textarea
              id="campaign-description"
              placeholder="Descreva brevemente a campanha"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
            />
          </div>

          <Button
            onClick={handleCreateCampaign}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold"
          >
            Criar Campanha
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCampaign;

