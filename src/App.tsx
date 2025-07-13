
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/Dashboard';
import { HomePage } from '@/components/HomePage';
import { ProfilePage } from '@/components/ProfilePage';
import { QuizSelection, QuizSelection as QuizSelectionType } from '@/components/quiz/QuizSelection';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminPasswordEdit } from '@/components/admin/AdminPasswordEdit';
import { Loader2 } from 'lucide-react';
import { PaymentSuccess } from '@/components/PaymentSuccess';

const queryClient = new QueryClient();

type AppState = 'home' | 'login' | 'signup' | 'dashboard' | 'quiz-selection' | 'quiz' | 'profile' | 'payment-success' | 'admin-login' | 'admin-dashboard' | 'admin-password-edit';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference && window.location.pathname === '/payment-success') {
      setAppState('payment-success');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Loading Project X...</p>
          <p className="text-sm text-gray-600 mt-2">Preparing your medical learning experience</p>
        </div>
      </div>
    );
  }

  const handleStartQuiz = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAppState('quiz-selection');
  };

  const handleStartActualQuiz = (selections: QuizSelectionType[]) => {
    console.log('Starting quiz with selections:', selections);
    // TODO: Implement quiz component
    setAppState('quiz');
  };

  const renderCurrentView = () => {
    switch (appState) {
      case 'home':
        return (
          <HomePage
            onLogin={() => setAppState('login')}
            onSignup={() => setAppState('signup')}
            onDashboard={() => setAppState('dashboard')}
            onAdminLogin={() => setAppState('admin-login')}
            isAuthenticated={!!user}
          />
        );
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
            <div className="w-full max-w-md">
              <LoginForm 
                onSwitchToSignup={() => setAppState('signup')} 
                onSuccess={() => setAppState('dashboard')}
                onBack={() => setAppState('home')}
              />
            </div>
          </div>
        );
      case 'signup':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4">
            <div className="w-full max-w-md">
              <SignupForm 
                onSwitchToLogin={() => setAppState('login')} 
                onSuccess={() => setAppState('dashboard')}
                onBack={() => setAppState('home')}
              />
            </div>
          </div>
        );
      case 'dashboard':
        if (!user) {
          setAppState('home');
          return null;
        }
        return (
          <Dashboard 
            onStartQuiz={handleStartQuiz}
            onViewProfile={() => setAppState('profile')}
            onHome={() => setAppState('home')}
          />
        );
      case 'quiz-selection':
        if (!user) {
          setAppState('home');
          return null;
        }
        return (
          <QuizSelection
            categoryId={selectedCategory}
            onBack={() => setAppState('dashboard')}
            onStartQuiz={handleStartActualQuiz}
          />
        );
      case 'profile':
        if (!user) {
          setAppState('home');
          return null;
        }
        return (
          <ProfilePage
            onBack={() => setAppState('dashboard')}
          />
        );
      case 'quiz':
        if (!user) {
          setAppState('home');
          return null;
        }
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧠</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Quiz Interface</h2>
              <p className="text-gray-600 mb-6">Advanced quiz component coming soon with 100+ questions per block!</p>
              <div className="space-y-3">
                <button 
                  onClick={() => setAppState('dashboard')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => setAppState('home')}
                  className="w-full px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        );
      case 'admin-login':
        return (
          <AdminLogin
            onSuccess={() => setAppState('admin-dashboard')}
            onBack={() => setAppState('home')}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onLogout={() => setAppState('home')}
            onEditPassword={() => setAppState('admin-password-edit')}
          />
        );
      case 'admin-password-edit':
        return (
          <AdminPasswordEdit
            onBack={() => setAppState('admin-dashboard')}
          />
        );
      case 'payment-success':
        return (
          <PaymentSuccess
            onBackToDashboard={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              setAppState('dashboard');
            }}
          />
        );
      default:
        return (
          <HomePage
            onLogin={() => setAppState('login')}
            onSignup={() => setAppState('signup')}
            onDashboard={() => setAppState('dashboard')}
            onAdminLogin={() => setAppState('admin-login')}
            isAuthenticated={!!user}
          />
        );
    }
  };

  return renderCurrentView();
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
