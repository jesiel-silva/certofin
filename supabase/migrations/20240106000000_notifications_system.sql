-- =============================================
-- CERTOFIN - MIGRAÇÃO: SISTEMA DE NOTIFICAÇÕES
-- =============================================

-- 1. CRIAR TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('overdue', 'due_soon', 'comparison', 'system')),
  scope TEXT CHECK (scope IN ('personal', 'business')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS RLS
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. FUNÇÃO: Gerar notificações de contas vencidas e vencendo
CREATE OR REPLACE FUNCTION public.generate_due_notifications(user_uuid UUID)
RETURNS void AS $$
DECLARE
  tx RECORD;
  user_plan TEXT;
  is_trial BOOLEAN;
BEGIN
  -- Buscar plano do usuário
  SELECT subscription_status INTO user_plan
  FROM public.profiles WHERE id = user_uuid;

  is_trial := public.is_trial_active(user_uuid);

  -- Contas vencidas (data < hoje, status pendente)
  FOR tx IN
    SELECT t.id, t.description, t.amount, t.transaction_date, t.scope, t.type
    FROM public.transactions t
    WHERE t.user_id = user_uuid
      AND t.status = 'pending'
      AND t.transaction_date < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = user_uuid
          AND n.type = 'overdue'
          AND n.metadata->>'transaction_id' = t.id::text
      )
  LOOP
    -- Notificação pessoal sempre pode
    IF tx.scope = 'personal' THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid,
        'overdue',
        'personal',
        'Conta vencida',
        format('"%s" está vencido(a) depuis %s — R$ %s',
          COALESCE(tx.description, 'Lançamento'),
          to_char(tx.transaction_date, 'DD/MM/YYYY'),
          to_char(tx.amount, 'FM999G990D99')
        ),
        jsonb_build_object('transaction_id', tx.id, 'amount', tx.amount)
      );
    -- Notificação business só se for pro/trial
    ELSIF tx.scope = 'business' AND (user_plan = 'pro' OR is_trial) THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid,
        'overdue',
        'business',
        'Conta vencida (Negócio)',
        format('"%s" está vencido(a) desde %s — R$ %s',
          COALESCE(tx.description, 'Lançamento'),
          to_char(tx.transaction_date, 'DD/MM/YYYY'),
          to_char(tx.amount, 'FM999G990D99')
        ),
        jsonb_build_object('transaction_id', tx.id, 'amount', tx.amount)
      );
    END IF;
  END LOOP;

  -- Contas vencendo (próximos 3 dias, status pendente)
  FOR tx IN
    SELECT t.id, t.description, t.amount, t.transaction_date, t.scope, t.type
    FROM public.transactions t
    WHERE t.user_id = user_uuid
      AND t.status = 'pending'
      AND t.transaction_date >= CURRENT_DATE
      AND t.transaction_date <= CURRENT_DATE + INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = user_uuid
          AND n.type = 'due_soon'
          AND n.metadata->>'transaction_id' = t.id::text
      )
  LOOP
    IF tx.scope = 'personal' THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid,
        'due_soon',
        'personal',
        'Conta vencendo em breve',
        format('"%s" vence em %s — R$ %s',
          COALESCE(tx.description, 'Lançamento'),
          to_char(tx.transaction_date, 'DD/MM/YYYY'),
          to_char(tx.amount, 'FM999G990D99')
        ),
        jsonb_build_object('transaction_id', tx.id, 'amount', tx.amount)
      );
    ELSIF tx.scope = 'business' AND (user_plan = 'pro' OR is_trial) THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid,
        'due_soon',
        'business',
        'Conta vencendo (Negócio)',
        format('"%s" vence em %s — R$ %s',
          COALESCE(tx.description, 'Lançamento'),
          to_char(tx.transaction_date, 'DD/MM/YYYY'),
          to_char(tx.amount, 'FM999G990D99')
        ),
        jsonb_build_object('transaction_id', tx.id, 'amount', tx.amount)
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO: Gerar notificação de comparativo mensal
CREATE OR REPLACE FUNCTION public.generate_comparison_notification(user_uuid UUID)
RETURNS void AS $$
DECLARE
  current_month_income NUMERIC;
  current_month_expense NUMERIC;
  prev_month_income NUMERIC;
  prev_month_expense NUMERIC;
  current_balance NUMERIC;
  prev_balance NUMERIC;
  user_plan TEXT;
  is_trial BOOLEAN;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles WHERE id = user_uuid;

  is_trial := public.is_trial_active(user_uuid);

  -- Mês atual pessoal
  SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO current_month_income, current_month_expense
  FROM public.transactions
  WHERE user_id = user_uuid AND scope = 'personal'
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  -- Mês anterior pessoal
  SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO prev_month_income, prev_month_expense
  FROM public.transactions
  WHERE user_id = user_uuid AND scope = 'personal'
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');

  current_balance := current_month_income - current_month_expense;
  prev_balance := prev_month_income - prev_month_expense;

  -- Só notifica se ambos os meses têm dados
  IF prev_month_income > 0 OR prev_month_expense > 0 THEN
    IF current_balance > prev_balance THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid, 'comparison', 'personal',
        'Mês melhorando!',
        format('Seu saldo pessoal de R$ %s é melhor que o mês passado (R$ %s). Continue assim!',
          to_char(current_balance, 'FM999G990D99'),
          to_char(prev_balance, 'FM999G990D99')
        ),
        jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'up')
      );
    ELSIF current_balance < prev_balance THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid, 'comparison', 'personal',
        'Atenção: mês piorando',
        format('Seu saldo pessoal de R$ %s é menor que o mês passado (R$ %s). Revise seus gastos.',
          to_char(current_balance, 'FM999G990D99'),
          to_char(prev_balance, 'FM999G990D99')
        ),
        jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'down')
      );
    END IF;
  END IF;

  -- Comparativo business (só para PRO/trial)
  IF user_plan = 'pro' OR is_trial THEN
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO current_month_income, current_month_expense
    FROM public.transactions
    WHERE user_id = user_uuid AND scope = 'business'
      AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO prev_month_income, prev_month_expense
    FROM public.transactions
    WHERE user_id = user_uuid AND scope = 'business'
      AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');

    current_balance := current_month_income - current_month_expense;
    prev_balance := prev_month_income - prev_month_expense;

    IF (prev_month_income > 0 OR prev_month_expense > 0) THEN
      IF current_balance > prev_balance THEN
        INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
        VALUES (
          user_uuid, 'comparison', 'business',
          'Negócio: mês melhorando!',
          format('O saldo do seu negócio de R$ %s é melhor que o mês passado (R$ %s).',
            to_char(current_balance, 'FM999G990D99'),
            to_char(prev_balance, 'FM999G990D99')
          ),
          jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'up')
        );
      ELSIF current_balance < prev_balance THEN
        INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
        VALUES (
          user_uuid, 'comparison', 'business',
          'Negócio: atenção ao mês',
          format('O saldo do seu negócio de R$ %s é menor que o mês passado (R$ %s).',
            to_char(current_balance, 'FM999G990D99'),
            to_char(prev_balance, 'FM999G990D99')
          ),
          jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'down')
        );
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO: Gerar notificações do sistema
CREATE OR REPLACE FUNCTION public.generate_system_notifications(user_uuid UUID)
RETURNS void AS $$
DECLARE
  user_plan TEXT;
  tx_count BIGINT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles WHERE id = user_uuid;

  -- Contar transações do mês
  SELECT COUNT(*) INTO tx_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE);

  -- Aviso quando atingir 80% do limite (Free)
  IF user_plan = 'free' AND tx_count >= 8 AND tx_count < 10 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = user_uuid AND type = 'system'
        AND title = 'Limite de lançamentos próximo'
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
    ) THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message)
      VALUES (
        user_uuid, 'system', NULL,
        'Limite de lançamentos próximo',
        format('Você já usou %s de 10 lançamentos grátis este mês. Considere fazer upgrade para o Pro.', tx_count)
      );
    END IF;
  END IF;

  -- Aviso quando atingir limite (Free)
  IF user_plan = 'free' AND tx_count >= 10 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = user_uuid AND type = 'system'
        AND title = 'Limite atingido'
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
    ) THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message)
      VALUES (
        user_uuid, 'system', NULL,
        'Limite atingido',
        'Você atingiu o limite de 10 lançamentos do plano grátis. Faça upgrade para continuar registrando.'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PRINCIPAL: Gerar todas as notificações
CREATE OR REPLACE FUNCTION public.refresh_notifications(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Limpar notificações antigas (mais de 30 dias)
  DELETE FROM public.notifications
  WHERE user_id = user_uuid
    AND created_at < NOW() - INTERVAL '30 days';

  -- Gerar notificações
  PERFORM public.generate_due_notifications(user_uuid);
  PERFORM public.generate_comparison_notification(user_uuid);
  PERFORM public.generate_system_notifications(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
