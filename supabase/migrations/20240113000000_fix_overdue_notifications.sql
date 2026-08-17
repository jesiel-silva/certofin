-- Migração: Atualização Automática de Notificações de Vencimento e Limpeza de Lançamentos Pagos

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
          ),
          created_at = NOW()
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
          ),
          created_at = NOW()
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
