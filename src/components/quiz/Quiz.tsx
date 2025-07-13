import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QuizSelection } from './QuizSelection';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  Trophy
} from 'lucide-react';

interface QuizProps {
  selections: QuizSelection[];
  onBack: () => void;
  onComplete: () => void;
}

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  explanation: string;
  subject_id: string;
  category_id: string;
}

interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export const Quiz: React.FC<QuizProps> = ({ selections, onBack, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleCompleteQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const allQuestions: Question[] = [];
      
      for (const selection of selections) {
        let query = supabase
          .from('quiz_questions')
          .select('*')
          .eq('category_id', selection.subjectId);
          
        if (selection.blockId) {
          query = query.eq('block_id', selection.blockId);
        }
        
        const { data, error } = await query.limit(selection.questionCount);
        
        if (error) throw error;
        if (data) {
          allQuestions.push(...data);
        }
      }
      
      // Shuffle questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (optionNumber: number) => {
    if (showExplanation) return;
    setSelectedOption(optionNumber);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedOption === question.correct_answer;
    
    const answer: Answer = {
      questionId: question.id,
      selectedOption,
      isCorrect
    };
    
    setAnswers(prev => [...prev, answer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    setQuizCompleted(true);
    
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const scorePercentage = (correctAnswers / questions.length) * 100;
    const timeTaken = (30 * 60) - timeLeft;
    
    try {
      // Save quiz result
      await supabase.from('quiz_results').insert({
        user_id: user?.id,
        category_id: selections[0]?.subjectId || 'mixed',
        subject_ids: selections.map(s => s.subjectId),
        total_questions: questions.length,
        correct_answers: correctAnswers,
        score_percentage: scorePercentage,
        time_taken_seconds: timeTaken
      });
      
      toast({
        title: "Quiz Completed!",
        description: `You scored ${scorePercentage.toFixed(1)}% (${correctAnswers}/${questions.length})`,
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
            <p className="text-muted-foreground mb-4">
              No questions found for the selected topics.
            </p>
            <Button onClick={onBack}>Back to Selection</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const scorePercentage = (correctAnswers / questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{scorePercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-medium">
                  {scorePercentage >= 80 ? '🎉 Excellent!' : 
                   scorePercentage >= 60 ? '👍 Good job!' : 
                   '📚 Keep studying!'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Time taken: {formatTime((30 * 60) - timeLeft)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={onComplete} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const options = [
    { label: 'A', text: currentQuestion.option_a },
    { label: 'B', text: currentQuestion.option_b },
    { label: 'C', text: currentQuestion.option_c },
    { label: 'D', text: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {options.map((option, index) => {
                const optionNumber = index + 1;
                const isSelected = selectedOption === optionNumber;
                const isCorrect = currentQuestion.correct_answer === optionNumber;
                
                let buttonVariant: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" = "outline";
                let className = "";
                
                if (showExplanation) {
                  if (isCorrect) {
                    buttonVariant = "default";
                    className = "bg-green-500 hover:bg-green-600 text-white border-green-500";
                  } else if (isSelected && !isCorrect) {
                    buttonVariant = "destructive";
                  }
                } else if (isSelected) {
                  buttonVariant = "default";
                }
                
                return (
                  <Button
                    key={option.label}
                    variant={buttonVariant}
                    className={`w-full text-left p-4 h-auto whitespace-normal ${className}`}
                    onClick={() => handleAnswerSelect(optionNumber)}
                    disabled={showExplanation}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background text-foreground flex items-center justify-center font-medium">
                        {option.label}
                      </div>
                      <div className="flex-1 text-left">{option.text}</div>
                      {showExplanation && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-white flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Explanation
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            disabled={currentQuestionIndex === 0}
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(prev => prev - 1);
                setSelectedOption(null);
                setShowExplanation(false);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {!showExplanation ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};