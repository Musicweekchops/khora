-- Migration 024: Add progress column to Task table
ALTER TABLE public."Task" ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
