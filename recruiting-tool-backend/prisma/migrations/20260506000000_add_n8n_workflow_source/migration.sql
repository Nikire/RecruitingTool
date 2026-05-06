-- Add N8N_WORKFLOW to ProspectSource enum
ALTER TYPE "ProspectSource" ADD VALUE IF NOT EXISTS 'N8N_WORKFLOW';
