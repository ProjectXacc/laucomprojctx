
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, ArrowLeft, Shield, Key } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface AdminPasswordEditProps {
  onBack: () => void;
}

export const AdminPasswordEdit: React.FC<AdminPasswordEditProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current admin user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error('Not authenticated');

      // Verify current password
      const { data: adminData, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.user.email)
        .single();

      if (fetchError || !adminData) {
        throw new Error('Admin user not found');
      }

      const isValidCurrentPassword = await bcrypt.compare(currentPassword, adminData.password_hash);
      if (!isValidCurrentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.user.email);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Admin password updated successfully",
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Go back after a short delay
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Update Password
          </CardTitle>
          <CardDescription>
            Change your admin panel password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="w-full mt-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
