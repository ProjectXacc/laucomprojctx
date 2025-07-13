import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Calendar,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';

interface QuizHistoryProps {
  onBack: () => void;
}

interface QuizResult {
  id: string;
  category_id: string;
  subject_ids: string[];
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken_seconds: number;
  completed_at: string;
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setQuizResults(data || []);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">Very Good</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
    if (score >= 60) return <Badge className="bg-orange-500">Fair</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  const calculateStats = () => {
    if (quizResults.length === 0) return { average: 0, total: 0, best: 0 };
    
    const total = quizResults.length;
    const average = quizResults.reduce((sum, result) => sum + result.score_percentage, 0) / total;
    const best = Math.max(...quizResults.map(result => result.score_percentage));
    
    return { average: Math.round(average), total, best: Math.round(best) };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quiz History</h1>
              <p className="text-muted-foreground">Track your progress and performance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Completed so far</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average}%</div>
              <p className="text-xs text-muted-foreground">Across all quizzes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.best}%</div>
              <p className="text-xs text-muted-foreground">Personal record</p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Results */}
        {quizResults.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Quiz Results Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start taking quizzes to see your performance history here.
              </p>
              <Button onClick={onBack}>Take Your First Quiz</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Quizzes</h2>
            {quizResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg capitalize">
                          {result.category_id.replace('-', ' ')} Quiz
                        </h3>
                        {getScoreBadge(result.score_percentage)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span>{result.correct_answers}/{result.total_questions} correct</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{result.score_percentage.toFixed(1)}% score</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(result.time_taken_seconds)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {result.subject_ids.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">Subjects:</div>
                          <div className="flex flex-wrap gap-1">
                            {result.subject_ids.map((subjectId, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subjectId.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {result.score_percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};