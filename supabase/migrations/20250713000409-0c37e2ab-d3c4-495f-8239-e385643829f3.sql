
-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'none',
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  payment_reference TEXT,
  amount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  block_id TEXT,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_questions table
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can access)
CREATE POLICY "Only authenticated admins can view admin_users" 
  ON public.admin_users 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" 
  ON public.subscriptions 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

CREATE POLICY "System can insert subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update subscriptions" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (true);

-- Quiz questions policies
CREATE POLICY "Anyone can view quiz questions" 
  ON public.quiz_questions 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quiz questions" 
  ON public.quiz_questions 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

-- Insert default admin user (password: admin123)
INSERT INTO public.admin_users (email, password_hash) 
VALUES ('admin@projectx.app', '$2b$10$rOvHPWyKlBHvFGHs8D9t8uJ1YvGQr2t8k4vZNjHgL1vFjL8kxAqBe');

-- Insert sample quiz questions for Anatomy - Upper Limb
INSERT INTO public.quiz_questions (category_id, subject_id, block_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('basic-medical-sciences', 'anatomy', 'upper-limb', 'Which muscle is primarily responsible for shoulder abduction?', 'Deltoid', 'Supraspinatus', 'Infraspinatus', 'Teres minor', 0, 'The deltoid muscle, particularly its middle fibers, is the primary abductor of the shoulder joint.'),
('basic-medical-sciences', 'anatomy', 'upper-limb', 'The brachial artery bifurcates into which two arteries?', 'Radial and ulnar arteries', 'Anterior and posterior interosseous arteries', 'Deep and superficial palmar arteries', 'Common and proper digital arteries', 0, 'The brachial artery divides into the radial and ulnar arteries at the level of the radial head in the cubital fossa.'),
('basic-medical-sciences', 'anatomy', 'upper-limb', 'Which nerve innervates the biceps brachii muscle?', 'Radial nerve', 'Median nerve', 'Ulnar nerve', 'Musculocutaneous nerve', 3, 'The musculocutaneous nerve innervates all muscles in the anterior compartment of the arm, including biceps brachii.'),
('basic-medical-sciences', 'anatomy', 'upper-limb', 'The anatomical snuffbox is bounded by tendons of which muscles?', 'Extensor pollicis longus and brevis, abductor pollicis longus', 'Flexor pollicis longus and brevis', 'Adductor pollicis and opponens pollicis', 'Extensor digitorum and extensor indicis', 0, 'The anatomical snuffbox is bounded by the tendons of extensor pollicis longus (medially) and extensor pollicis brevis with abductor pollicis longus (laterally).'),
('basic-medical-sciences', 'anatomy', 'upper-limb', 'Which bone forms the lateral border of the cubital fossa?', 'Humerus', 'Radius', 'Ulna', 'Brachioradialis muscle', 3, 'The lateral border of the cubital fossa is formed by the brachioradialis muscle, not a bone.');
