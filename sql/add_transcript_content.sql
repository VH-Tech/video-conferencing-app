-- Add column to store the full WebVTT transcript content
ALTER TABLE public.transcripts
ADD COLUMN IF NOT EXISTS content text;

-- Add comment to document the column
COMMENT ON COLUMN public.transcripts.content IS 'Full WebVTT transcript content downloaded from Daily.co';
