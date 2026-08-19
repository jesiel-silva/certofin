-- =============================================================
-- Notificação de sistema: Central de Ajuda
-- Execute este script no SQL Editor do Supabase Dashboard
-- =============================================================

INSERT INTO notifications (user_id, type, scope, title, message, is_read, metadata)
SELECT
  id,
  'system',
  NULL,
  'Nova Central de Ajuda disponível!',
  'Agora você pode acessar a Central de Ajuda pelo menu lateral. Lá você encontra guias completos sobre perfil, lançamentos, categorias, notificações, planos e muito mais. Tire todas as suas dúvidas de forma rápida e fácil!',
  FALSE,
  jsonb_build_object(
    'feature', 'help_center',
    'version', '1.0.0',
    'link', '/personal/ajuda'
  )
FROM profiles
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications n
  WHERE n.user_id = profiles.id
    AND n.type = 'system'
    AND n.metadata->>'feature' = 'help_center'
);
