-- Add constituent-facing brief content column to briefs table
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS brief_content TEXT;
