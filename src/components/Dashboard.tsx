import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Trophy, 
  Calendar, 
  User, 
  Moon, 
  Sun, 
  CreditCard,
  AlertTriangle,
  Home,
  RefreshCw
} from 'lucide-react';
import { quizCategories } from '@/data/quizData';
import { paymentService } from '@/services/paymentService';

interface DashboardProps {
  onStartQuiz: (categoryId: string) => void;
  onViewProfile: () => void;
  onHome: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, onViewProfile, onHome }) => {
  const { user, logout, refreshSubscription } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleRefreshSubscription = async () => {
    console.log('Manually refreshing subscription...');
    await refreshSubscription();
    toast({
      title: "Subscription Status Refreshed", 
      description: "Your subscription status has been updated.",
    });
  };

  const getSubscriptionBadge = () => {
    if (!user) return null;
    
    let badgeVariant: 'default' | 'destructive' | 'secondary' = 'destructive';
    let badgeText = 'No Subscription';
    
    if (user.subscriptionStatus === 'active') {
      badgeVariant = 'default';
      badgeText = 'Active';
    } else if (user.subscriptionStatus === 'trial') {
      badgeVariant = 'secondary';
      badgeText = 'Free Trial';
    } else if (user.subscriptionStatus === 'expired') {
      badgeVariant = 'destructive';
      badgeText = 'Expired';
    }
    
    return <Badge variant={badgeVariant}>{badgeText}</Badge>;
  };

  const canAccessQuiz = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trial';

  const handleSubscribe = async () => {
    try {
      toast({
        title: "Initializing Payment",
        description: "Redirecting to Paystack checkout...",
      });

      const paymentData = await paymentService.initializePayment(100000, "Monthly Subscription");
      
      // Redirect to Paystack payment page
      paymentService.redirectToPayment(paymentData.authorization_url);
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">
              Project X
            </h1>
            {getSubscriptionBadge()}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={onViewProfile}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Ready to continue your medical studies? Choose a category to begin.
          </p>
        </div>

        {/* Subscription Alert */}
        {!canAccessQuiz && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Subscription Required</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You need an active subscription to access quizzes. Subscribe now for ₦1,000/month to continue learning!
            </p>
            <Button className="mt-3" size="sm" onClick={handleSubscribe}>
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe Now - ₦1,000/month
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Start your first quiz!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--%</div>
              <p className="text-xs text-muted-foreground">Complete a quiz to see your average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshSubscription}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.subscriptionStatus === 'active' ? 'Active' : 
                 user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Inactive'}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.subscriptionStatus === 'trial' && user?.trialEndsAt ? 
                  `Trial ends: ${new Date(user.trialEndsAt).toLocaleDateString()}` :
                  user?.subscriptionExpiry ? 
                    `Expires: ${new Date(user.subscriptionExpiry).toLocaleDateString()}` : 
                    'Subscribe to access all features'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quizCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {category.name}
                  <Badge variant="secondary">
                    {category.subjects.length} Subjects
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Comprehensive quizzes covering all essential topics in {category.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {category.subjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="flex justify-between text-sm">
                      <span>{subject.name}</span>
                      <span className="text-muted-foreground">
                        {subject.questionCount || subject.blocks?.reduce((acc, block) => acc + block.questionCount, 0) || 0} questions
                      </span>
                    </div>
                  ))}
                  {category.subjects.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{category.subjects.length - 3} more subjects
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => onStartQuiz(category.id)}
                  disabled={!canAccessQuiz}
                >
                  {canAccessQuiz ? 'Start Quiz' : 'Subscription Required'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
