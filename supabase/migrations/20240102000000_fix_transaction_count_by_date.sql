-- =============================================
-- CORREÇÃO: Contagem de transações usa transaction_date em vez de created_at
-- =============================================

CREATE OR REPLACE FUNCTION public.check_monthly_transaction_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transaction_count BIGINT;
  user_plan TEXT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;
  
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date::date) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN transaction_count < 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_transaction_count(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  transaction_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date::date) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN COALESCE(transaction_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_plan_info(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_plan TEXT;
  transaction_count BIGINT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date::date) = DATE_TRUNC('month', CURRENT_DATE);
  
  result := json_build_object(
    'plan', COALESCE(user_plan, 'free'),
    'monthly_transactions', COALESCE(transaction_count, 0),
    'max_transactions', CASE 
      WHEN user_plan = 'pro' THEN -1
      ELSE 30
    END,
    'can_use_business', user_plan = 'pro',
    'can_use_installment', user_plan = 'pro'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
