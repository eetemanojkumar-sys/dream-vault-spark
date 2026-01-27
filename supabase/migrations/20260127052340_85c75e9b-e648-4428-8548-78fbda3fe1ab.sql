-- Create enum for dream categories
CREATE TYPE public.dream_category AS ENUM (
  'personal',
  'career',
  'health',
  'financial',
  'creative',
  'spiritual',
  'relationships',
  'adventure'
);

-- Create enum for dream priority
CREATE TYPE public.dream_priority AS ENUM ('low', 'medium', 'high');

-- Create enum for dream status
CREATE TYPE public.dream_status AS ENUM ('active', 'completed', 'archived', 'paused');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dreams table
CREATE TABLE public.dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category dream_category NOT NULL DEFAULT 'personal',
  priority dream_priority NOT NULL DEFAULT 'medium',
  target_date DATE,
  status dream_status NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Dreams policies
CREATE POLICY "Users can view their own dreams" 
  ON public.dreams FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams" 
  ON public.dreams FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams" 
  ON public.dreams FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams" 
  ON public.dreams FOR DELETE 
  USING (auth.uid() = user_id);

-- Milestones policies (based on dream ownership)
CREATE POLICY "Users can view milestones for their dreams" 
  ON public.milestones FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = milestones.dream_id 
    AND dreams.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for their dreams" 
  ON public.milestones FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = milestones.dream_id 
    AND dreams.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their dreams" 
  ON public.milestones FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = milestones.dream_id 
    AND dreams.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their dreams" 
  ON public.milestones FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = milestones.dream_id 
    AND dreams.user_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_dreams_status ON public.dreams(status);
CREATE INDEX idx_dreams_category ON public.dreams(category);
CREATE INDEX idx_dreams_priority ON public.dreams(priority);
CREATE INDEX idx_milestones_dream_id ON public.milestones(dream_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);