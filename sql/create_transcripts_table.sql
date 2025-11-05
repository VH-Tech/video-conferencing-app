-- Create transcripts table to store metadata about transcripts
CREATE TABLE IF NOT EXISTS public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id text UNIQUE NOT NULL, -- Daily.co transcript ID
  room_name text REFERENCES public.rooms(room_name) ON DELETE CASCADE NOT NULL,
  meeting_date timestamptz NOT NULL,
  duration interval,
  status text NOT NULL, -- e.g., 'finished', 'processing'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view transcripts for rooms they created
CREATE POLICY "Users can view their room transcripts"
  ON public.transcripts
  FOR SELECT
  TO authenticated
  USING (
    room_name IN (
      SELECT room_name FROM public.rooms WHERE creator_id = auth.uid()
    )
  );

-- Only authenticated users can insert transcripts
CREATE POLICY "Authenticated users can create transcripts"
  ON public.transcripts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    room_name IN (
      SELECT room_name FROM public.rooms WHERE creator_id = auth.uid()
    )
  );

-- Users can update transcripts for their rooms
CREATE POLICY "Users can update their room transcripts"
  ON public.transcripts
  FOR UPDATE
  TO authenticated
  USING (
    room_name IN (
      SELECT room_name FROM public.rooms WHERE creator_id = auth.uid()
    )
  )
  WITH CHECK (
    room_name IN (
      SELECT room_name FROM public.rooms WHERE creator_id = auth.uid()
    )
  );

-- Users can delete transcripts for their rooms
CREATE POLICY "Users can delete their room transcripts"
  ON public.transcripts
  FOR DELETE
  TO authenticated
  USING (
    room_name IN (
      SELECT room_name FROM public.rooms WHERE creator_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_transcripts_transcript_id ON public.transcripts(transcript_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_room_name ON public.transcripts(room_name);
CREATE INDEX IF NOT EXISTS idx_transcripts_meeting_date ON public.transcripts(meeting_date);

-- Create updated_at trigger
CREATE TRIGGER update_transcripts_updated_at
  BEFORE UPDATE ON public.transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
