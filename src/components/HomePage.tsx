
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Trophy, Star, Shield, Sparkles, Heart, Zap } from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onDashboard?: () => void;
  onAdminLogin: () => void;
  isAuthenticated: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onLogin, 
  onSignup, 
  onDashboard, 
  onAdminLogin,
  isAuthenticated 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Project X
              </h1>
              <p className="text-xs text-gray-600">Medical Excellence Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Button 
                onClick={onDashboard}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onLogin} className="border-blue-200 hover:bg-blue-50">
                  Login
                </Button>
                <Button 
                  onClick={onSignup}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAdminLogin}
              className="text-gray-500 hover:text-gray-700"
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent block mt-2">
              Project X ✨
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate medical quiz platform designed for medical students and professionals. 
            Test your knowledge, track your progress, and excel in your medical education with our colorful, engaging interface! 🚀
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Button 
                size="lg" 
                onClick={onSignup}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl text-lg px-8 py-4"
              >
                <Heart className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onLogin}
                className="border-2 border-blue-200 hover:bg-blue-50 text-lg px-8 py-4"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose Project X? 🌟
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-blue-700">Comprehensive Content 📚</CardTitle>
                <CardDescription>
                  Access thousands of medical questions across all major specialties and subjects with 100+ questions per block!
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-green-700">Track Progress 📊</CardTitle>
                <CardDescription>
                  Monitor your learning journey with detailed analytics, colorful progress indicators, and performance insights.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-purple-700">Personalized Learning 🎯</CardTitle>
                <CardDescription>
                  Adaptive quizzes that focus on your weak areas to maximize learning efficiency with engaging visuals.
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="opacity-90">Questions 📝</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-xl">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="opacity-90">Medical Specialties 🏥</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-2xl shadow-xl">
              <div className="text-5xl font-bold mb-2">5K+</div>
              <div className="opacity-90">Active Students 👥</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-2xl shadow-xl">
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="opacity-90">Success Rate 🎉</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto text-center">
            <div className="mb-6">
              <span className="text-6xl">🚀✨</span>
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of medical students already using Project X to excel in their studies with our vibrant, engaging platform!
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={onSignup}
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-4"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Your Journey Today
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="mb-4">
            <span className="text-2xl">💜</span>
          </div>
          <p>&copy; 2024 Project X. All rights reserved. Made with love for medical students! ✨</p>
        </div>
      </footer>
    </div>
  );
};
