import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Shield,
  Search,
  RefreshCw,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface UserSubscription {
  user_id: string;
  user_email: string;
  user_name: string;
  subscription_status: 'active' | 'expired' | 'trial' | 'none';
  subscription_start: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  is_trial: boolean;
  amount: number | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredSubscriptions: number;
  noSubscription: number;
  totalRevenue: number;
}

export const SubscriptionManagement: React.FC = () => {
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    expiredSubscriptions: 0,
    noSubscription: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSubscriptions();
    setupRealtimeSubscription();

    return () => {
      // Cleanup will be handled by the channel unsubscribe
    };
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [userSubscriptions, searchTerm, statusFilter]);

  const setupRealtimeSubscription = () => {
    // Set up real-time subscriptions for both tables
    const subscriptionsChannel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          console.log('Subscription change detected:', payload);
          fetchUserSubscriptions();
          toast({
            title: "Real-time Update",
            description: "Subscription data updated",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('User profile change detected:', payload);
          fetchUserSubscriptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionsChannel);
    };
  };

  const fetchUserSubscriptions = async () => {
    try {
      setIsLoading(true);

      // Get user profiles (this includes user_id and display_name)
      const { data: userProfiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name');

      if (profileError) throw profileError;

      // Get all subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subError) throw subError;

      // Combine the data
      const combinedData: UserSubscription[] = [];
      
      // Create a map of user profiles for quick lookup
      const profileMap = new Map(userProfiles?.map(p => [p.user_id, p]) || []);
      
      // Process users from user_profiles (all registered users have profiles)
      for (const profile of userProfiles || []) {
        const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
        
        // Determine subscription status
        let subscriptionStatus: 'active' | 'expired' | 'trial' | 'none' = 'none';
        
        if (subscription) {
          const now = new Date();
          
          if (subscription.is_trial && subscription.trial_end) {
            const trialEnd = new Date(subscription.trial_end);
            subscriptionStatus = trialEnd > now ? 'trial' : 'expired';
          } else if (subscription.subscription_end) {
            const subEnd = new Date(subscription.subscription_end);
            subscriptionStatus = subEnd > now ? 'active' : 'expired';
          }
        }

        combinedData.push({
          user_id: profile.user_id,
          user_email: 'Email not available', // Can't access auth.users directly
          user_name: profile.display_name || 'Unknown User',
          subscription_status: subscriptionStatus,
          subscription_start: subscription?.subscription_start || null,
          subscription_end: subscription?.subscription_end || null,
          trial_end: subscription?.trial_end || null,
          is_trial: subscription?.is_trial || false,
          amount: subscription?.amount || null,
          payment_reference: subscription?.payment_reference || null,
          created_at: subscription?.created_at || new Date().toISOString(),
          updated_at: subscription?.updated_at || new Date().toISOString()
        });
      }

      setUserSubscriptions(combinedData);
      calculateStats(combinedData);

    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: UserSubscription[]) => {
    const stats = data.reduce(
      (acc, user) => {
        acc.totalUsers++;
        
        switch (user.subscription_status) {
          case 'active':
            acc.activeSubscriptions++;
            break;
          case 'trial':
            acc.trialUsers++;
            break;
          case 'expired':
            acc.expiredSubscriptions++;
            break;
          case 'none':
            acc.noSubscription++;
            break;
        }
        
        if (user.amount) {
          acc.totalRevenue += user.amount;
        }
        
        return acc;
      },
      {
        totalUsers: 0,
        activeSubscriptions: 0,
        trialUsers: 0,
        expiredSubscriptions: 0,
        noSubscription: 0,
        totalRevenue: 0
      }
    );

    setStats(stats);
  };

  const filterSubscriptions = () => {
    let filtered = userSubscriptions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  const getStatusBadge = (status: string, isTrialExpired?: boolean) => {
    const variants = {
      active: { variant: 'default' as const, icon: UserCheck, text: 'Active' },
      trial: { variant: 'secondary' as const, icon: Clock, text: 'Trial' },
      expired: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Expired' },
      none: { variant: 'outline' as const, icon: UserX, text: 'No Subscription' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.none;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getTimeRemaining = (endDate: string | null) => {
    if (!endDate) return 'N/A';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active</CardTitle>
            <UserCheck className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Trial</CardTitle>
            <Clock className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">No Sub</CardTitle>
            <UserX className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noSubscription}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats.totalRevenue / 100).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all user subscriptions
              </CardDescription>
            </div>
            <Button onClick={fetchUserSubscriptions} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="none">No Subscription</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Remaining</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.user_name}</div>
                          <div className="text-sm text-muted-foreground">{user.user_email}</div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {user.user_id.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.subscription_status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.is_trial && user.trial_end 
                            ? getTimeRemaining(user.trial_end)
                            : getTimeRemaining(user.subscription_end)
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.subscription_start ? 
                          new Date(user.subscription_start).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div>
                          {user.is_trial && user.trial_end ? (
                            <div>
                              <div className="text-sm">Trial: {new Date(user.trial_end).toLocaleDateString()}</div>
                            </div>
                          ) : user.subscription_end ? (
                            new Date(user.subscription_end).toLocaleDateString()
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ₦{user.amount ? (user.amount / 100).toLocaleString() : '0'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.payment_reference || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};