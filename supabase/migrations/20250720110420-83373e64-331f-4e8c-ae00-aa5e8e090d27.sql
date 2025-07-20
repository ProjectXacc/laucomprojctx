-- Enable real-time functionality for subscriptions table
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.subscriptions;

-- Enable real-time functionality for user_profiles table  
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_profiles;