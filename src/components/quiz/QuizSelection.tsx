
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { quizCategories, QuizSubject, QuizBlock } from '@/data/quizData';

interface QuizSelectionProps {
  categoryId: string;
  onBack: () => void;
  onStartQuiz: (selections: QuizSelection[]) => void;
}

export interface QuizSelection {
  subjectId: string;
  subjectName: string;
  blockId?: string;
  blockName?: string;
  questionCount: number;
}

export const QuizSelection: React.FC<QuizSelectionProps> = ({ 
  categoryId, 
  onBack, 
  onStartQuiz 
}) => {
  const [selectedItems, setSelectedItems] = useState<QuizSelection[]>([]);
  const [timerMinutes, setTimerMinutes] = useState(30);

  const category = quizCategories.find(c => c.id === categoryId);
  
  if (!category) {
    return <div>Category not found</div>;
  }

  const handleSelectionChange = (
    subject: QuizSubject, 
    checked: boolean,
    block?: QuizBlock
  ) => {
    const selectionId = block ? `${subject.id}-${block.id}` : subject.id;
    
    if (checked) {
      const newSelection: QuizSelection = {
        subjectId: subject.id,
        subjectName: subject.name,
        blockId: block?.id,
        blockName: block?.name,
        questionCount: block?.questionCount || subject.questionCount
      };
      setSelectedItems(prev => [...prev, newSelection]);
    } else {
      setSelectedItems(prev => 
        prev.filter(item => 
          block ? 
            !(item.subjectId === subject.id && item.blockId === block.id) :
            item.subjectId !== subject.id
        )
      );
    }
  };

  const isSelected = (subject: QuizSubject, block?: QuizBlock) => {
    return selectedItems.some(item => 
      block ? 
        item.subjectId === subject.id && item.blockId === block.id :
        item.subjectId === subject.id && !item.blockId
    );
  };

  const totalQuestions = selectedItems.reduce((sum, item) => sum + item.questionCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{category.name}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Select Quiz Topics</h2>
          <p className="text-muted-foreground">
            Choose the subjects and blocks you want to practice. You can select multiple topics for a comprehensive quiz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {category.subjects.map(subject => (
                <Card key={subject.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected(subject)}
                          onCheckedChange={(checked) => 
                            handleSelectionChange(subject, checked as boolean)
                          }
                          disabled={subject.blocks && subject.blocks.length > 0}
                        />
                        <span>{subject.name}</span>
                        {subject.isMasterBlock && (
                          <Badge variant="secondary">Master Block</Badge>
                        )}
                      </CardTitle>
                      <Badge>
                        {subject.questionCount || 
                         subject.blocks?.reduce((sum, block) => sum + block.questionCount, 0) || 0} 
                        questions
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {subject.blocks && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subject.blocks.map(block => (
                          <div key={block.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={isSelected(subject, block)}
                              onCheckedChange={(checked) => 
                                handleSelectionChange(subject, checked as boolean, block)
                              }
                            />
                            <div className="flex-1">
                              <div className="font-medium">{block.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {block.questionCount} questions
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>
                  Configure your quiz preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Timer (minutes)</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimerMinutes(Math.max(5, timerMinutes - 5))}
                    >
                      -
                    </Button>
                    <span className="flex-1 text-center font-mono">
                      {timerMinutes} min
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimerMinutes(Math.min(180, timerMinutes + 5))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Selected Topics:</span>
                    <Badge variant="secondary">{selectedItems.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Total Questions:</span>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-mono">{totalQuestions}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Estimated Time:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{Math.ceil(totalQuestions * 1.5)} min</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => onStartQuiz(selectedItems)}
                  disabled={selectedItems.length === 0}
                >
                  Start Quiz ({totalQuestions} questions)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
