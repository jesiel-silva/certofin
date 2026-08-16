-- =============================================
-- CERTOFIN - MIGRAÇÃO: RASTREAR USO DO TRIAL
-- =============================================

-- 1. ADICIONAR CAMPO trial_used_at NA TABELA PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMPTZ;