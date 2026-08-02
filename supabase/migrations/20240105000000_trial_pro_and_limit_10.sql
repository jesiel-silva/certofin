-- =============================================
-- CERTOFIN - MIGRAÇÃO: TRIAL PRO 7 DIAS + LIMITE 10
-- =============================================

-- 1. ADICIONAR CAMPO trial_ends_at NA TABELA PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. FUNÇÃO: verificar se usuário está em trial ativo
CREATE OR REPLACE FUNCTION public.is_trial_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT trial_ends_at INTO trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  -- Se não tem trial ou trial expirou
  IF trial_end IS NULL OR trial_end < NOW() THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO: verificar se usuário é pro (pago OU trial)
CREATE OR REPLACE FUNCTION public.is_pro_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;

  -- Se é pro pago
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Se está em trial ativo
  IF public.is_trial_active(user_uuid) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATUALIZAR FUNÇÃO get_user_plan_info para considerar trial
CREATE OR REPLACE FUNCTION public.get_user_plan_info(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_plan TEXT;
  transaction_count BIGINT;
  trial_end TIMESTAMPTZ;
  is_trial BOOLEAN;
BEGIN
  -- Buscar plano e trial
  SELECT subscription_status, trial_ends_at INTO user_plan, trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  -- Verificar se trial está ativo
  is_trial := public.is_trial_active(user_uuid);

  -- Contar transações do mês (usando transaction_date)
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  -- Montar resultado
  result := json_build_object(
    'plan', COALESCE(user_plan, 'free'),
    'is_trial', COALESCE(is_trial, FALSE),
    'trial_ends_at', trial_end,
    'monthly_transactions', COALESCE(transaction_count, 0),
    'max_transactions', CASE
      WHEN user_plan = 'pro' THEN -1  -- ilimitado
      WHEN is_trial THEN -1           -- trial = ilimitado
      ELSE 10                         -- free = 10
    END,
    'can_use_business', user_plan = 'pro' OR is_trial,
    'can_use_installment', user_plan = 'pro' OR is_trial
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATUALIZAR FUNÇÃO check_monthly_transaction_limit (limite 10)
CREATE OR REPLACE FUNCTION public.check_monthly_transaction_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transaction_count BIGINT;
  is_pro BOOLEAN;
BEGIN
  -- Verificar se é pro (pago ou trial)
  is_pro := public.is_pro_active(user_uuid);

  -- Se for Pro (pago ou trial), não tem limite
  IF is_pro THEN
    RETURN TRUE;
  END IF;

  -- Contar transações do mês atual
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  -- Limite de 10 transações para o plano free
  RETURN transaction_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATUALIZAR FUNÇÃO can_use_business_scope (trial = pode)
CREATE OR REPLACE FUNCTION public.can_use_business_scope(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_pro_active(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ATUALIZAR FUNÇÃO can_use_installment (trial = pode)
CREATE OR REPLACE FUNCTION public.can_use_installment(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_pro_active(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ATUALIZAR TRIGGER enforce_plan_limits para considerar trial
CREATE OR REPLACE FUNCTION public.enforce_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  can_proceed BOOLEAN;
  is_pro BOOLEAN;
BEGIN
  -- Verificar se é pro (pago ou trial)
  is_pro := public.is_pro_active(NEW.user_id);

  -- Verificar escopo business
  IF NEW.scope = 'business' AND NOT is_pro THEN
    RAISE EXCEPTION 'Escopo business disponível apenas no plano Pro';
  END IF;

  -- Verificar parcelado
  IF NEW.frequency = 'installment' AND NOT is_pro THEN
    RAISE EXCEPTION 'Lançamentos parcelados disponíveis apenas no plano Pro';
  END IF;

  -- Verificar limite de transações (apenas para inserts)
  IF TG_OP = 'INSERT' THEN
    can_proceed := public.check_monthly_transaction_limit(NEW.user_id);
    IF NOT can_proceed THEN
      RAISE EXCEPTION 'Limite de 10 transações mensais atingido. Faça upgrade para o plano Pro';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
