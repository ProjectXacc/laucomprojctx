
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSuccess: () => void;
  onBack: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onSuccess, onBack }) => {
  const [matricNumber, setMatricNumber] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length !== 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be exactly 6 digits.',
        variant: 'destructive'
      });
      return;
    }

    const success = await login(matricNumber, password);
    if (success) {
      onSuccess();
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid matriculation number or password.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold gradient-medical bg-clip-text text-transparent">
          Welcome to Project X
        </CardTitle>
        <CardDescription>
          Sign in to access your medical quiz platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="matric">Matriculation Number</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="matric"
                type="text"
                placeholder="Enter your matric number"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password (6 digits)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter 6-digit password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={onSwitchToSignup}
            className="text-sm text-primary hover:underline"
          >
            Don't have an account? Sign up
          </button>
          <br />
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to Home
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
