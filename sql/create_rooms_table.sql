-- Create rooms table to track room creators
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name text UNIQUE NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone authenticated can read rooms
CREATE POLICY "Anyone can view rooms"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert rooms
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Only room creators can update their rooms
CREATE POLICY "Room creators can update their rooms"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Only room creators can delete their rooms
CREATE POLICY "Room creators can delete their rooms"
  ON public.rooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_room_name ON public.rooms(room_name);
CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON public.rooms(creator_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
