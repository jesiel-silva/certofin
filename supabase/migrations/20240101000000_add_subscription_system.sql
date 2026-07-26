-- =============================================
-- CERTOFIN - MIGRAÇÃO: SISTEMA DE PLANOS
-- =============================================

-- 1. ADICIONAR CAMPOS DE ASSINATURA NA TABELA PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free'
  CHECK (subscription_status IN ('free', 'pro'));

-- 2. FUNÇÃO PARA VERIFICAR LIMITE DE TRANSAÇÕES DO MÊS
CREATE OR REPLACE FUNCTION public.check_monthly_transaction_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transaction_count BIGINT;
  user_plan TEXT;
BEGIN
  -- Buscar plano do usuário
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Se for Pro, não tem limite
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;
  
  -- Contar transações do mês atual para usuários free
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  -- Limite de 30 transações para o plano free
  RETURN transaction_count < 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA OBTER CONTA DE TRANSAÇÕES DO MÊS
CREATE OR REPLACE FUNCTION public.get_monthly_transaction_count(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  transaction_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN COALESCE(transaction_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE USAR ESCOPO BUSINESS
CREATE OR REPLACE FUNCTION public.can_use_business_scope(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  RETURN user_plan = 'pro';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE USAR PARCELADO
CREATE OR REPLACE FUNCTION public.can_use_installment(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  RETURN user_plan = 'pro';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA OBTER DADOS DO PLANO DO USUÁRIO
CREATE OR REPLACE FUNCTION public.get_user_plan_info(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_plan TEXT;
  transaction_count BIGINT;
BEGIN
  -- Buscar plano
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Contar transações do mês
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  -- Montar resultado
  result := json_build_object(
    'plan', COALESCE(user_plan, 'free'),
    'monthly_transactions', COALESCE(transaction_count, 0),
    'max_transactions', CASE 
      WHEN user_plan = 'pro' THEN -1  -- ilimitado
      ELSE 30
    END,
    'can_use_business', user_plan = 'pro',
    'can_use_installment', user_plan = 'pro'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ATUALIZAR POLÍTICA RLS PARA BLOQUEAR TRANSAÇÕES BUSINESS EM PLANO FREE
-- (A verificação será feita via função no frontend, mas adicionamos uma trigger de segurança)

CREATE OR REPLACE FUNCTION public.enforce_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  can_proceed BOOLEAN;
  user_plan TEXT;
BEGIN
  -- Buscar plano do usuário
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Verificar escopo business
  IF NEW.scope = 'business' AND user_plan != 'pro' THEN
    RAISE EXCEPTION 'Escopo business disponível apenas no plano Pro';
  END IF;
  
  -- Verificar parcelado
  IF NEW.frequency = 'installment' AND user_plan != 'pro' THEN
    RAISE EXCEPTION 'Lançamentos parcelados disponíveis apenas no plano Pro';
  END IF;
  
  -- Verificar limite de transações (apenas para inserts, não updates)
  IF TG_OP = 'INSERT' THEN
    can_proceed := public.check_monthly_transaction_limit(NEW.user_id);
    IF NOT can_proceed THEN
      RAISE EXCEPTION 'Limite de 30 transações mensais atingido. Faça upgrade para o plano Pro';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger de verificação de limites
DROP TRIGGER IF EXISTS enforce_plan_limits ON public.transactions;
CREATE TRIGGER enforce_plan_limits
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limits();
