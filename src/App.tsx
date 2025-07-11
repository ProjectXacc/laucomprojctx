
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
import { QuizSelection, QuizSelection as QuizSelectionType } from '@/components/quiz/QuizSelection';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

type AppState = 'login' | 'signup' | 'dashboard' | 'quiz-selection' | 'quiz' | 'profile';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('login');
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          {appState === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAppState('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAppState('login')} />
          )}
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
      case 'dashboard':
        return (
          <Dashboard 
            onStartQuiz={handleStartQuiz}
            onViewProfile={() => setAppState('profile')}
          />
        );
      case 'quiz-selection':
        return (
          <QuizSelection
            categoryId={selectedCategory}
            onBack={() => setAppState('dashboard')}
            onStartQuiz={handleStartActualQuiz}
          />
        );
      case 'profile':
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Profile Page</h2>
              <p className="text-muted-foreground mb-4">Profile management coming soon!</p>
              <button 
                onClick={() => setAppState('dashboard')}
                className="text-primary hover:underline"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Interface</h2>
              <p className="text-muted-foreground mb-4">Quiz component coming soon!</p>
              <button 
                onClick={() => setAppState('dashboard')}
                className="text-primary hover:underline"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            onStartQuiz={handleStartQuiz}
            onViewProfile={() => setAppState('profile')}
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
