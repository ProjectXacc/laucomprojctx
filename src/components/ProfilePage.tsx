
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Settings, 
  Edit2, 
  Save,
  X,
  Trophy,
  BookOpen,
  Target,
  ArrowLeft
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    streakDays: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setSubscription(data[0]);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchUserStats = async () => {
    // Mock stats for now - you can implement actual quiz results tracking later
    setStats({
      quizzesCompleted: Math.floor(Math.random() * 50) + 10,
      averageScore: Math.floor(Math.random() * 30) + 70,
      streakDays: Math.floor(Math.random() * 14) + 1,
      totalPoints: Math.floor(Math.random() * 5000) + 1000
    });
  };

  const handleSaveProfile = async () => {
    try {
      updateProfile({ name: editedName });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return <Badge variant="secondary">No Subscription</Badge>;
    
    const badgeVariant = subscription.subscription_status === 'active' ? 'default' : 'destructive';
    const badgeText = subscription.subscription_status === 'active' ? 'Active' : 
                      subscription.subscription_status === 'expired' ? 'Expired' : 'Inactive';
    
    return <Badge variant={badgeVariant}>{badgeText}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-sm text-gray-600">Manage your account settings</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Profile Information
                  </span>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(user?.name || '');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-purple-500 to-pink-600"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">{user?.name || 'Not set'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <div className="p-2 bg-gray-50 rounded-md">{user?.email}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Matric Number
                    </Label>
                    <div className="p-2 bg-gray-50 rounded-md">{user?.matricNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Current Plan:</span>
                      {getSubscriptionBadge()}
                    </div>
                    {subscription && subscription.subscription_end && (
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
                      </p>
                    )}
                    {subscription && subscription.amount && (
                      <p className="text-sm text-gray-600">
                        Amount: ₦{(subscription.amount / 100).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {(!subscription || subscription.subscription_status !== 'active') && (
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600">
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Quizzes Completed</span>
                    <span className="font-bold text-xl">{stats.quizzesCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Average Score</span>
                    <span className="font-bold text-xl">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Study Streak</span>
                    <span className="font-bold text-xl">{stats.streakDays} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Total Points</span>
                    <span className="font-bold text-xl">{stats.totalPoints.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Quiz History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
