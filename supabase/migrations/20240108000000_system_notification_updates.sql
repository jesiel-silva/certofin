-- =============================================
-- CERTOFIN - MIGRAÇÃO: NOTIFICAÇÃO DE ATUALIZAÇÕES
-- =============================================

-- Inserir notificação do sistema para todos os usuários
INSERT INTO public.notifications (user_id, type, scope, title, message, is_read, created_at)
SELECT 
  id,
  'system',
  NULL,
  'Novidades no CertoFin!',
  'Confira as melhorias: 1. Dashboard agora mostra receitas recorrentes nos cards. 2. Gráfico de categorias inclui despesas recorrentes. 3. Ao marcar como pago, a transação fica no mês atual e cria uma nova para o próximo mês.',
  FALSE,
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications n
  WHERE n.user_id = auth.users.id
    AND n.type = 'system'
    AND n.title = 'Novidades no CertoFin!'
    AND n.created_at > NOW() - INTERVAL '7 days'
);
