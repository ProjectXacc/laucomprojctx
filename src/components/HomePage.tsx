
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Trophy, Star } from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onDashboard?: () => void;
  isAuthenticated: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onLogin, 
  onSignup, 
  onDashboard, 
  isAuthenticated 
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Project X</h1>
          </div>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button onClick={onDashboard}>Go to Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={onLogin}>Login</Button>
                <Button onClick={onSignup}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Master Medical Knowledge with
            <span className="text-primary block">Project X</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate medical quiz platform designed for medical students and professionals. 
            Test your knowledge, track your progress, and excel in your medical education.
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Button size="lg" onClick={onSignup}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={onLogin}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose Project X?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Comprehensive Content</CardTitle>
                <CardDescription>
                  Access thousands of medical questions across all major specialties and subjects.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning journey with detailed analytics and performance insights.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Personalized Learning</CardTitle>
                <CardDescription>
                  Adaptive quizzes that focus on your weak areas to maximize learning efficiency.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Medical Specialties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of medical students already using Project X to excel in their studies.
            </p>
            <Button size="lg" variant="secondary" onClick={onSignup}>
              Start Your Journey Today
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Project X. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
