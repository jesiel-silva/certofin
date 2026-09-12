-- ============================================================
-- NOTIFICAÇÃO: Nova funcionalidade - Marcar como Pago ou Pendente
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE type = 'system'
      AND title = 'Novidade: Marcar como Pago ou Pendente'
      AND created_at > NOW() - INTERVAL '7 days'
  ) THEN
    INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at, metadata)
    SELECT
      gen_random_uuid(),
      p.id,
      'system',
      'Novidade: Marcar como Pago ou Pendente',
      'Agora, ao criar um lançamento de despesa ou receita, você pode escolher se ele já foi pago/recebido ou está pendente.

- Pendente: o valor ainda não foi pago (despesa) ou recebido (receita)
- Pago / Recebido: o valor já saiu ou entrou na conta

Basta selecionar a opção desejada no momento de criar o lançamento. Se não escolher nada, continua ficando como pendente, como antes.',
      FALSE,
      NOW(),
      '{"feature": "payment_status_selector", "version": "2.1"}'::jsonb
    FROM profiles p
    WHERE p.id IS NOT NULL;
  END IF;
END $$;
