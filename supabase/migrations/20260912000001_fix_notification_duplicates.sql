-- ============================================================
-- FIX: Eliminar notificações duplicadas
-- ============================================================

-- 1. CORRIGIR generate_comparison_notification
-- Adicionar verificação de duplicação: só cria se não existir
-- notificação comparativa do mesmo mês/escopo nos últimos 7 dias
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
  current_month_key TEXT;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles WHERE id = user_uuid;

  is_trial := public.is_trial_active(user_uuid);

  -- Chave do mês atual para controle de duplicação
  current_month_key := to_char(CURRENT_DATE, 'YYYY-MM');

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
      -- Verificar se já existe notificação comparativa pessoal deste mês
      IF NOT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = user_uuid
          AND type = 'comparison'
          AND scope = 'personal'
          AND metadata->>'month' = current_month_key
      ) THEN
        INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
        VALUES (
          user_uuid, 'comparison', 'personal',
          'Mês melhorando!',
          format('Seu saldo pessoal de R$ %s é melhor que o mês passado (R$ %s). Continue assim!',
            to_char(current_balance, 'FM999G990D99'),
            to_char(prev_balance, 'FM999G990D99')
          ),
          jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'up', 'month', current_month_key)
        );
      END IF;
    ELSIF current_balance < prev_balance THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = user_uuid
          AND type = 'comparison'
          AND scope = 'personal'
          AND metadata->>'month' = current_month_key
      ) THEN
        INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
        VALUES (
          user_uuid, 'comparison', 'personal',
          'Atenção: mês piorando',
          format('Seu saldo pessoal de R$ %s é menor que o mês passado (R$ %s). Revise seus gastos.',
            to_char(current_balance, 'FM999G990D99'),
            to_char(prev_balance, 'FM999G990D99')
          ),
          jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'down', 'month', current_month_key)
        );
      END IF;
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
        IF NOT EXISTS (
          SELECT 1 FROM public.notifications
          WHERE user_id = user_uuid
            AND type = 'comparison'
            AND scope = 'business'
            AND metadata->>'month' = current_month_key
        ) THEN
          INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
          VALUES (
            user_uuid, 'comparison', 'business',
            'Negócio: mês melhorando!',
            format('O saldo do seu negócio de R$ %s é melhor que o mês passado (R$ %s).',
              to_char(current_balance, 'FM999G990D99'),
              to_char(prev_balance, 'FM999G990D99')
            ),
            jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'up', 'month', current_month_key)
          );
        END IF;
      ELSIF current_balance < prev_balance THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.notifications
          WHERE user_id = user_uuid
            AND type = 'comparison'
            AND scope = 'business'
            AND metadata->>'month' = current_month_key
        ) THEN
          INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
          VALUES (
            user_uuid, 'comparison', 'business',
            'Negócio: atenção ao mês',
            format('O saldo do seu negócio de R$ %s é menor que o mês passado (R$ %s).',
              to_char(current_balance, 'FM999G990D99'),
              to_char(prev_balance, 'FM999G990D99')
            ),
            jsonb_build_object('current', current_balance, 'previous', prev_balance, 'trend', 'down', 'month', current_month_key)
          );
        END IF;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORRIGIR generate_due_notifications
-- Remover SET created_at = NOW() que reseta timestamp desnecessariamente
CREATE OR REPLACE FUNCTION public.generate_due_notifications(user_uuid UUID)
RETURNS void AS $$
DECLARE
  tx RECORD;
  user_plan TEXT;
  is_trial BOOLEAN;
BEGIN
  SELECT subscription_status INTO user_plan
  FROM public.profiles WHERE id = user_uuid;

  is_trial := public.is_trial_active(user_uuid);

  -- 1. APAGAR NOTIFICAÇÕES DE VENCIMENTO CUJOS LANÇAMENTOS JÁ FORAM PAGOS OU REMOVIDOS
  DELETE FROM public.notifications n
  WHERE n.user_id = user_uuid
    AND n.type IN ('overdue', 'due_soon')
    AND n.metadata->>'transaction_id' IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id::text = n.metadata->>'transaction_id'
        AND t.status = 'pending'
    );

  -- 2. ATUALIZAR NOTIFICAÇÕES 'due_soon' EXISTENTES PARA 'overdue' SE A DATA JÁ PASSOU
  FOR tx IN
    SELECT t.id, t.description, t.amount, t.transaction_date, t.scope
    FROM public.transactions t
    WHERE t.user_id = user_uuid
      AND t.status = 'pending'
      AND t.transaction_date < CURRENT_DATE
  LOOP
    IF tx.scope = 'personal' THEN
      UPDATE public.notifications
      SET type = 'overdue',
          title = 'Conta vencida',
          message = format('"%s" está vencido(a) desde %s — R$ %s',
            COALESCE(tx.description, 'Lançamento'),
            to_char(tx.transaction_date, 'DD/MM/YYYY'),
            to_char(tx.amount, 'FM999G990D99')
          )
      WHERE user_id = user_uuid
        AND type = 'due_soon'
        AND metadata->>'transaction_id' = tx.id::text;
    ELSIF tx.scope = 'business' AND (user_plan = 'pro' OR is_trial) THEN
      UPDATE public.notifications
      SET type = 'overdue',
          title = 'Conta vencida (Negócio)',
          message = format('"%s" está vencido(a) desde %s — R$ %s',
            COALESCE(tx.description, 'Lançamento'),
            to_char(tx.transaction_date, 'DD/MM/YYYY'),
            to_char(tx.amount, 'FM999G990D99')
          )
      WHERE user_id = user_uuid
        AND type = 'due_soon'
        AND metadata->>'transaction_id' = tx.id::text;
    END IF;
  END LOOP;

  -- 3. CRIAR NOVAS NOTIFICAÇÕES DE CONTAS VENCIDAS (data < hoje, sem notificação prévia)
  FOR tx IN
    SELECT t.id, t.description, t.amount, t.transaction_date, t.scope, t.type
    FROM public.transactions t
    WHERE t.user_id = user_uuid
      AND t.status = 'pending'
      AND t.transaction_date < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = user_uuid
          AND n.metadata->>'transaction_id' = t.id::text
      )
  LOOP
    IF tx.scope = 'personal' THEN
      INSERT INTO public.notifications (user_id, type, scope, title, message, metadata)
      VALUES (
        user_uuid,
        'overdue',
        'personal',
        'Conta vencida',
        format('"%s" está vencido(a) desde %s — R$ %s',
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

  -- 4. CRIAR NOVAS NOTIFICAÇÕES DE CONTAS VENCENDO EM BREVE (próximos 3 dias)
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

-- 3. LIMPAR NOTIFICAÇÕES DUPLICADAS EXISTENTES
-- Remove duplicatas de comparison (mantém a mais recente por mês/escopo)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, type, scope, metadata->>'month'
    ORDER BY created_at DESC
  ) AS rn
  FROM public.notifications
  WHERE type = 'comparison'
    AND metadata->>'month' IS NOT NULL
)
DELETE FROM public.notifications
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Remove duplicatas de overdue/due_soon por transaction_id (mantém a mais recente)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, type, scope, metadata->>'transaction_id'
    ORDER BY created_at DESC
  ) AS rn
  FROM public.notifications
  WHERE type IN ('overdue', 'due_soon')
    AND metadata->>'transaction_id' IS NOT NULL
)
DELETE FROM public.notifications
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
