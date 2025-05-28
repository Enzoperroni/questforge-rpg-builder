
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";

type AuthProps = {
  onAuthenticated: () => void;
}

const Auth = ({ onAuthenticated }: AuthProps) => {
  const [signinUsername, setSigninUsername] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async () => {
    if (!signupUsername || !signupPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const email = `${signupUsername.toLowerCase()}@rpgcreator.app`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: signupPassword,
      options: {
        data: {
          username: signupUsername
        }
      }
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created",
        description: "You can now sign in with your credentials."
      });
    }

    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!signinUsername || !signinPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const email = `${signinUsername.toLowerCase()}@rpgcreator.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: signinPassword
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      onAuthenticated();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center">
          <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">RPG Creator Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white/20">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white/20">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Username"
                  value={signinUsername}
                  onChange={(e) => setSigninUsername(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                />
                <Button 
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Choose Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                />
                <Input
                  type="password"
                  placeholder="Choose Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                />
                <Button 
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <User className="mr-2 h-4 w-4" />
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
