import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Auth from './components/Auth';
import { AuthProvider, useAuth } from './hooks/useAuth';

import Index from './pages/Index';
import CreateCampaign from './pages/CreateCampaign';
import MasterView from './pages/MasterView';
import PlayerView from './pages/PlayerView';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuth(true);
    } else if (user) {
      setShowAuth(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Auth onAuthenticated={() => setShowAuth(false)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/master/:code" element={<MasterView />} />
            <Route path="/campaign/:code" element={<PlayerView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
