-- Add columns to store the AI-generated meeting summary
ALTER TABLE public.transcripts
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS executive_summary text,
ADD COLUMN IF NOT EXISTS key_points text[],
ADD COLUMN IF NOT EXISTS important_numbers text[],
ADD COLUMN IF NOT EXISTS action_items text[],
ADD COLUMN IF NOT EXISTS speaker_insights text[],
ADD COLUMN IF NOT EXISTS questions_raised text[],
ADD COLUMN IF NOT EXISTS open_questions text[],
ADD COLUMN IF NOT EXISTS participants text,
ADD COLUMN IF NOT EXISTS transcript_language text;

-- Add comments to document the columns
COMMENT ON COLUMN public.transcripts.title IS 'AI-generated concise meeting title (3-8 words)';
COMMENT ON COLUMN public.transcripts.description IS 'Brief description of meeting purpose and agenda';
COMMENT ON COLUMN public.transcripts.executive_summary IS '2-3 sentence overview of main discussion';
COMMENT ON COLUMN public.transcripts.key_points IS 'Main topics covered in the meeting';
COMMENT ON COLUMN public.transcripts.important_numbers IS 'Significant figures, dates, or statistics mentioned';
COMMENT ON COLUMN public.transcripts.action_items IS 'Next steps or follow-ups mentioned';
COMMENT ON COLUMN public.transcripts.speaker_insights IS 'Key insights or lessons shared';
COMMENT ON COLUMN public.transcripts.questions_raised IS 'Questions asked during the meeting';
COMMENT ON COLUMN public.transcripts.open_questions IS 'Unresolved questions or topics needing discussion';
COMMENT ON COLUMN public.transcripts.participants IS 'List of meeting participants';
COMMENT ON COLUMN public.transcripts.transcript_language IS 'Detected language (Hinglish/English/Hindi)';
