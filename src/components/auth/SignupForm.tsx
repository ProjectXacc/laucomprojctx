
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Lock, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
  onBack: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSuccess, onBack }) => {
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, isLoading } = useAuth();
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

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    const success = await signup(name, matricNumber, password);
    if (success) {
      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully!',
      });
      onSuccess();
    } else {
      toast({
        title: 'Signup Failed',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Welcome to Project X
        </CardTitle>
        <CardDescription>
          Create your account to start your medical journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

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
                placeholder="Create 6-digit password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={onSwitchToLogin}
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
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
