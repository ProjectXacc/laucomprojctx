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
    // Required fields validation
    const requiredFields = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'category_id', 'subject_id'];
    for (const field of requiredFields) {
      if (!question[field] && question[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate correct_answer is between 1-4
    if (![1, 2, 3, 4].includes(question.correct_answer)) {
      throw new Error('correct_answer must be 1, 2, 3, or 4');
    }

    // Set default difficulty if not provided
    if (!question.difficulty_level) {
      question.difficulty_level = 'medium';
    }

    // Set block_id if provided
    if (blockId) {
      question.block_id = blockId;
    }

    return question as QuizQuestion;
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
          errors.push(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`);
        }
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in the file');
      }

      // Insert questions into database
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(validQuestions);

      if (error) {
        throw error;
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
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload questions',
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
          errors.push(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`);
        }
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in the JSON');
      }

      // Insert questions into database
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(validQuestions);

      if (error) {
        throw error;
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
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload questions',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sampleFormat = [
    {
      "question": "What is the capital of France?",
      "option_a": "London",
      "option_b": "Berlin",
      "option_c": "Paris",
      "option_d": "Madrid",
      "correct_answer": 3,
      "explanation": "Paris is the capital and largest city of France.",
      "category_id": "geography",
      "subject_id": "world_capitals",
      "difficulty_level": "easy"
    }
  ];

  const quizBlocks = [
    { value: "block1", label: "Block 1" },
    { value: "block2", label: "Block 2" },
    { value: "block3", label: "Block 3" },
    { value: "block4", label: "Block 4" },
    { value: "block5", label: "Block 5" },
  ];

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
              {quizBlocks.map((block) => (
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
            <strong>Required fields:</strong> question, option_a, option_b, option_c, option_d, correct_answer (1-4), category_id, subject_id
            <br />
            <strong>Optional fields:</strong> explanation, block_id, difficulty_level (defaults to 'medium')
          </p>
        </div>
      </CardContent>
    </Card>
  );
};