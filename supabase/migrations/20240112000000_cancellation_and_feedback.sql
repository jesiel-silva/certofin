-- Migração: Pesquisa de Satisfação no Cancelamento e Função de Exclusão de Conta

-- 1. Criar tabela de feedbacks de cancelamento
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'cancel_subscription' ou 'delete_account'
  primary_reason VARCHAR(100) NOT NULL,
  feedback_text TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para cancellation_feedback
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem inserir seus próprios feedbacks"
  ON cancellation_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ler seus próprios feedbacks"
  ON cancellation_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Função RPC para excluir conta do usuário (remoção em cascata dos dados)
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garantir que o usuário só pode apagar a própria conta
  IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Acesso negado: você só pode apagar a sua própria conta.';
  END IF;

  -- Apagar registros relacionados
  DELETE FROM transactions WHERE user_id = target_user_id;
  DELETE FROM categories WHERE user_id = target_user_id;
  DELETE FROM notifications WHERE user_id = target_user_id;
  DELETE FROM cancellation_feedback WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;

  -- Nota: auth.users é gerenciado pelo Supabase Auth.
END;
$$;
