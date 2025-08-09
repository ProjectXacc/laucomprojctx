import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { quizCategories } from '@/data/quizData';
import { Upload, FileText, CheckCircle, AlertCircle, Type } from 'lucide-react';

interface QuizQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  explanation?: string;
  category_id: string;
  subject_id: string;
  block_id?: string;
  difficulty_level?: string;
}

export const QuizManagement: React.FC = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const validateQuizQuestion = (question: any, blockId?: string): QuizQuestion | null => {
    if (!question.question || typeof question.question !== 'string' || question.question.trim() === '') {
      throw new Error('Question must have a valid question field');
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error('Question must have a question field and options array with 4 items');
    }

    // Validate that all options are non-empty strings
    for (let i = 0; i < question.options.length; i++) {
      if (!question.options[i] || typeof question.options[i] !== 'string' || question.options[i].trim() === '') {
        throw new Error(`Option ${i + 1} must be a non-empty string`);
      }
    }

    if (!question.answer || typeof question.answer !== 'string') {
      throw new Error('Question must have an answer field with string value');
    }

    // Find the index of the correct answer in the options array
    const correctAnswerIndex = question.options.findIndex((option: string) => 
      option.toLowerCase().trim() === question.answer.toLowerCase().trim()
    );

    if (correctAnswerIndex === -1) {
      throw new Error(`Answer "${question.answer}" not found in options`);
    }

    const selectedBlock = getAllBlocks().find(block => block.value === blockId);
    if (!selectedBlock) {
      throw new Error('Invalid block selected');
    }

    return {
      question: question.question,
      option_a: question.options[0],
      option_b: question.options[1],
      option_c: question.options[2],
      option_d: question.options[3],
      // Store as 0-based to satisfy DB constraint (0..3)
      correct_answer: correctAnswerIndex,
      explanation: question.explanation || null,
      category_id: selectedBlock.category,
      subject_id: selectedBlock.subject,
      block_id: blockId || null,
      difficulty_level: question.difficulty || 'medium'
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JSON file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const fileContent = await file.text();
      const questionsData = JSON.parse(fileContent);

      if (!Array.isArray(questionsData)) {
        throw new Error('JSON file must contain an array of questions');
      }

      const validQuestions: QuizQuestion[] = [];
      const errors: string[] = [];

      // Validate each question
      questionsData.forEach((question, index) => {
        try {
          const validQuestion = validateQuizQuestion(question, selectedBlock);
          if (validQuestion) {
            validQuestions.push(validQuestion);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Invalid format';
          errors.push(`Question ${index + 1}: ${errorMessage}`);
          console.error(`Question ${index + 1} validation error:`, error, 'Question data:', question);
        }
      });

      if (validQuestions.length === 0) {
        throw new Error(`No valid questions found in the file. ${errors.length > 0 ? 'Errors: ' + errors.slice(0, 3).join('; ') : ''}`);
      }

      // Insert questions into database
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(validQuestions);

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      setUploadResult({
        success: validQuestions.length,
        failed: questionsData.length - validQuestions.length,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

      toast({
        title: "Upload Successful",
        description: `${validQuestions.length} questions uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload questions';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleJsonSubmit = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No JSON Input",
        description: "Please enter JSON data.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBlock) {
      toast({
        title: "No Block Selected",
        description: "Please select a quiz block.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const questionsData = JSON.parse(jsonInput);

      if (!Array.isArray(questionsData)) {
        throw new Error('JSON must contain an array of questions');
      }

      const validQuestions: QuizQuestion[] = [];
      const errors: string[] = [];

      // Validate each question
      questionsData.forEach((question, index) => {
        try {
          const validQuestion = validateQuizQuestion(question, selectedBlock);
          if (validQuestion) {
            validQuestions.push(validQuestion);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Invalid format';
          errors.push(`Question ${index + 1}: ${errorMessage}`);
          console.error(`Question ${index + 1} validation error:`, error, 'Question data:', question);
        }
      });

      if (validQuestions.length === 0) {
        throw new Error(`No valid questions found in the JSON. ${errors.length > 0 ? 'Errors: ' + errors.slice(0, 3).join('; ') : ''}`);
      }

      // Insert questions into database
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(validQuestions);

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      setUploadResult({
        success: validQuestions.length,
        failed: questionsData.length - validQuestions.length,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

      toast({
        title: "Upload Successful",
        description: `${validQuestions.length} questions uploaded successfully.`,
      });

      setJsonInput('');

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload questions';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sampleFormat = [
    {
      "question": "Which bone is found in the upper arm?",
      "options": ["Humerus", "Femur", "Radius", "Tibia"],
      "answer": "Humerus",
      "explanation": "The humerus is the long bone in the upper arm that extends from the shoulder to the elbow.",
      "difficulty": "easy"
    },
    {
      "question": "What is the primary action of the biceps brachii muscle?",
      "options": ["Flexion of the forearm", "Extension of the forearm", "Rotation of the shoulder", "Abduction of the arm"],
      "answer": "Flexion of the forearm",
      "explanation": "The biceps brachii is primarily responsible for flexing the forearm at the elbow joint.",
      "difficulty": "medium"
    }
  ];

  // Get all available blocks from quiz data
  const getAllBlocks = () => {
    const blocks: { value: string; label: string; category: string; subject: string }[] = [];
    
    quizCategories.forEach(category => {
      category.subjects.forEach(subject => {
        if (subject.blocks) {
          subject.blocks.forEach(block => {
            blocks.push({
              value: block.id,
              label: `${category.name} > ${subject.name} > ${block.name}`,
              category: category.id,
              subject: subject.id
            });
          });
        } else if (!subject.isMasterBlock) {
          // For subjects without blocks, treat the subject itself as a block
          blocks.push({
            value: subject.id,
            label: `${category.name} > ${subject.name}`,
            category: category.id,
            subject: subject.id
          });
        }
      });
    });
    
    return blocks;
  };

  const availableBlocks = getAllBlocks();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quiz Questions Management
        </CardTitle>
        <CardDescription>
          Upload quiz questions in bulk using JSON format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Block Selection */}
        <div className="space-y-2">
          <Label htmlFor="block-select">Select Quiz Block</Label>
          <Select value={selectedBlock} onValueChange={setSelectedBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a quiz block" />
            </SelectTrigger>
            <SelectContent>
              {availableBlocks.map((block) => (
                <SelectItem key={block.value} value={block.value}>
                  {block.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload/Input Tabs */}
        <Tabs defaultValue="json-input" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json-input" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Type JSON
            </TabsTrigger>
            <TabsTrigger value="file-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json-input" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">Enter Quiz Questions JSON</Label>
              <Textarea
                id="json-input"
                placeholder="Paste your JSON array of questions here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                disabled={isUploading}
              />
            </div>
            <Button 
              onClick={handleJsonSubmit} 
              disabled={isUploading || !selectedBlock || !jsonInput.trim()}
              className="w-full"
            >
              {isUploading ? 'Processing...' : 'Upload Questions'}
            </Button>
          </TabsContent>

          <TabsContent value="file-upload" className="space-y-4">
            <div>
              <Label htmlFor="quiz-file">Upload Quiz Questions (JSON)</Label>
              <Input
                id="quiz-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isUploading || !selectedBlock}
                className="mt-1"
              />
            </div>
          </TabsContent>
        </Tabs>

        {isUploading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Upload className="h-4 w-4 animate-pulse" />
            <span>Processing questions...</span>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{uploadResult.success} questions uploaded successfully</span>
            </div>
            
            {uploadResult.failed > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span>{uploadResult.failed} questions failed validation</span>
              </div>
            )}

            {uploadResult.errors.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sample Format */}
        <div className="space-y-3">
          <Label>Sample JSON Format:</Label>
          <Textarea
            value={JSON.stringify(sampleFormat, null, 2)}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            <strong>Required fields:</strong> question, options (array of 4 strings), answer (exact match to one option)
            <br />
            <strong>Optional fields:</strong> explanation, difficulty (defaults to 'medium')
            <br />
            <strong>Important:</strong> Make sure all fields are properly filled and the answer exactly matches one of the options.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};