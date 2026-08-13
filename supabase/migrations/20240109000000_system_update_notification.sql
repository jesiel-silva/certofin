-- =============================================
-- CERTOFIN - MIGRAÇÃO: NOTIFICAÇÃO DE ATUALIZAÇÃO
-- =============================================

-- Inserir notificação de sistema para todos os usuários sobre as correções de hoje
INSERT INTO public.notifications (user_id, type, scope, title, message, is_read, created_at)
SELECT 
  id AS user_id,
  'system' AS type,
  NULL AS scope,
  'Atualização CertoFin - Correções Importantes' AS title,
  'Olá! Realizamos melhorias importantes: 1) Transações recorrentes pagas não aparecem mais como pendentes no mês atual. 2) Cards "A receber" e "A pagar" mostram apenas pendências do mês selecionado. 3) Gráfico "Comparação com Mês Anterior" agora inclui recorrências pagas. As correções valem para os escopos Pessoal e Negócio.' AS message,
  FALSE AS is_read,
  NOW() AS created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications n
  WHERE n.user_id = auth.users.id
  AND n.type = 'system'
  AND n.title = 'Atualização CertoFin - Correções Importantes'
  AND n.created_at >= NOW() - INTERVAL '1 day'
);
