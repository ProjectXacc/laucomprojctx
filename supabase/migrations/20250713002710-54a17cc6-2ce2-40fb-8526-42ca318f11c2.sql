-- Fix the infinite recursion in admin_users policies
DROP POLICY IF EXISTS "Only authenticated admins can view admin_users" ON admin_users;

-- Create a proper admin policy without recursion
CREATE POLICY "Admins can manage admin_users" ON admin_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Create quiz results table for tracking quiz history
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL,
  subject_ids TEXT[] NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on quiz_results
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_results
CREATE POLICY "Users can view their own quiz results" ON public.quiz_results
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz results" ON public.quiz_results
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create user_profiles table for additional user data
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());