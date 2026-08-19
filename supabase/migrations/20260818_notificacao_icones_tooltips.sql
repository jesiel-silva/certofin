-- ============================================================
-- NOTIFICAÇÃO: Ícones de Categoria + Tooltips de Ajuda
-- ============================================================

-- Verifica se já existe uma notificação similar (evita duplicatas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM notifications
    WHERE type = 'system'
      AND title = 'Novidades: Ícones e Ajuda'
      AND created_at > NOW() - INTERVAL '7 days'
  ) THEN
    INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at, metadata)
    SELECT
      gen_random_uuid(),
      p.id,
      'system',
      'Novidades: Ícones e Ajuda',
      'Olá! O CertoFim ganhou melhorias para facilitar seu dia a dia:

Ícones nas categorias
Agora cada categoria tem seu próprio ícone visual. Quando você criar ou editar um lançamento, verá opções como carrinho, casa, carro, saúde e mais — tudo para identificar seus gastos de um jeito rápido e fácil.

Dicas de ajuda em todo o sistema
Passando o mouse sobre o "?" ao lado de cada título, botão ou seção, aparece uma explicação simples do que aquilo significa. Não precisa mais ficar na dúvida!

Para acessar o guia completo de dúvidas, vá no menu lateral e clique em AJUDA.',
      FALSE,
      NOW(),
      '{"feature": "category_icons_and_tooltips", "version": "2.0"}'::jsonb
    FROM profiles p
    WHERE p.id IS NOT NULL;
  END IF;
END $$;
