-- =============================================
-- CERTOFIN - MIGRAÇÃO: ENDURECIMENTO RLS/BILING
-- =============================================

-- 1. TRIGGER: IMPEDIR USUÁRIO DE ALTERAR COLUNAS DE FATURAMENTO DIRETAMENTE
-- Bloqueia apenas quando a requisição é do próprio usuário (auth.uid() = id).
-- Acesso via service role (auth.uid() NULL) e RPCs continua funcionando.
CREATE OR REPLACE FUNCTION public.prevent_direct_billing_update()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id THEN
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      RAISE EXCEPTION 'Não é permitido alterar subscription_status diretamente.';
    END IF;
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
      RAISE EXCEPTION 'Não é permitido alterar stripe_customer_id diretamente.';
    END IF;
    IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
      RAISE EXCEPTION 'Não é permitido alterar stripe_subscription_id diretamente.';
    END IF;
    IF NEW.stripe_price_id IS DISTINCT FROM OLD.stripe_price_id THEN
      RAISE EXCEPTION 'Não é permitido alterar stripe_price_id diretamente.';
    END IF;
    IF NEW.current_period_end IS DISTINCT FROM OLD.current_period_end THEN
      RAISE EXCEPTION 'Não é permitido alterar current_period_end diretamente.';
    END IF;
    IF NEW.cancel_at_period_end IS DISTINCT FROM OLD.cancel_at_period_end THEN
      RAISE EXCEPTION 'Não é permitido alterar cancel_at_period_end diretamente.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prevent_direct_billing_update ON public.profiles;
CREATE TRIGGER prevent_direct_billing_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_direct_billing_update();

-- 2. GUARDAS auth.uid() NAS FUNÇÕES SECURITY DEFINER
-- Garante que um usuário só consulta/modifica os próprios dados (auth.uid() NULL = service role, permitido).

CREATE OR REPLACE FUNCTION public.is_trial_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode consultar o seu próprio plano.';
  END IF;

  SELECT trial_ends_at INTO trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  IF trial_end IS NULL OR trial_end < NOW() THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_pro_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  period_end TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode consultar o seu próprio plano.';
  END IF;

  SELECT subscription_status, current_period_end INTO user_plan, period_end
  FROM public.profiles
  WHERE id = user_uuid;

  -- Pro pago somente enquanto o período estiver dentro da vigência
  IF user_plan = 'pro' AND (period_end IS NULL OR period_end > NOW()) THEN
    RETURN TRUE;
  END IF;

  -- Trial ativo também concede acesso Pro
  IF public.is_trial_active(user_uuid) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_plan_info(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_plan TEXT;
  transaction_count BIGINT;
  trial_end TIMESTAMPTZ;
  is_trial BOOLEAN;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode consultar o seu próprio plano.';
  END IF;

  SELECT subscription_status, trial_ends_at INTO user_plan, trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  is_trial := public.is_trial_active(user_uuid);

  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  result := json_build_object(
    'plan', COALESCE(user_plan, 'free'),
    'is_trial', COALESCE(is_trial, FALSE),
    'trial_ends_at', trial_end,
    'monthly_transactions', COALESCE(transaction_count, 0),
    'max_transactions', CASE
      WHEN user_plan = 'pro' THEN -1
      WHEN is_trial THEN -1
      ELSE 10
    END,
    'can_use_business', user_plan = 'pro' OR is_trial,
    'can_use_installment', user_plan = 'pro' OR is_trial
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_monthly_transaction_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transaction_count BIGINT;
  is_pro BOOLEAN;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode consultar o seu próprio limite.';
  END IF;

  is_pro := public.is_pro_active(user_uuid);

  IF is_pro THEN
    RETURN TRUE;
  END IF;

  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  RETURN transaction_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_monthly_transaction_count(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  transaction_count BIGINT;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode consultar os seus próprios dados.';
  END IF;

  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date::date) = DATE_TRUNC('month', CURRENT_DATE);

  RETURN COALESCE(transaction_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_use_business_scope(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  RETURN public.is_pro_active(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_use_installment(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  RETURN public.is_pro_active(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. GUARDA NA FUNÇÃO QUE GERA/MODIFICA NOTIFICAÇÕES (mais sensível: apaga e cria linhas)
CREATE OR REPLACE FUNCTION public.refresh_notifications(user_uuid UUID)
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Acesso negado: você só pode gerenciar as suas próprias notificações.';
  END IF;

  DELETE FROM public.notifications
  WHERE user_id = user_uuid
    AND created_at < NOW() - INTERVAL '30 days';

  PERFORM public.generate_due_notifications(user_uuid);
  PERFORM public.generate_comparison_notification(user_uuid);
  PERFORM public.generate_system_notifications(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;