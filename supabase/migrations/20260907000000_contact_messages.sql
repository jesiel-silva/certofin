-- Migração: Mensagens recebidas pelo canal Fale Conosco

-- 1. Criar tabela de mensagens de contato
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS para contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Visitantes e usuários logados podem enviar mensagens (página pública de contato)
CREATE POLICY "Contact messages can be inserted by anyone"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Somente o dono da mensagem (por e-mail autenticado) pode ler as próprias mensagens
CREATE POLICY "Users can read their own contact messages"
  ON contact_messages
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);