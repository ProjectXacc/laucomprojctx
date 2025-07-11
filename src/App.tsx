
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
import { QuizSelection, QuizSelection as QuizSelectionType } from '@/components/quiz/QuizSelection';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

type AppState = 'home' | 'login' | 'signup' | 'dashboard' | 'quiz-selection' | 'quiz' | 'profile';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Project X...</p>
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
            isAuthenticated={!!user}
          />
        );
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
          <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
        // Redirect to home if not authenticated
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
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Profile Page</h2>
              <p className="text-muted-foreground mb-4">Profile management coming soon!</p>
              <div className="space-x-4">
                <button 
                  onClick={() => setAppState('dashboard')}
                  className="text-primary hover:underline"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => setAppState('home')}
                  className="text-primary hover:underline"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        );
      case 'quiz':
        if (!user) {
          setAppState('home');
          return null;
        }
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Interface</h2>
              <p className="text-muted-foreground mb-4">Quiz component coming soon!</p>
              <div className="space-x-4">
                <button 
                  onClick={() => setAppState('dashboard')}
                  className="text-primary hover:underline"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => setAppState('home')}
                  className="text-primary hover:underline"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <HomePage
            onLogin={() => setAppState('login')}
            onSignup={() => setAppState('signup')}
            onDashboard={() => setAppState('dashboard')}
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
