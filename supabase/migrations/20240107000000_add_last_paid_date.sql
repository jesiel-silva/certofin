-- Adicionar coluna para rastrear última data de pagamento de recorrências
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS last_paid_date DATE;

-- Comentário para documentação
COMMENT ON COLUMN transactions.last_paid_date IS 'Data da última parcela paga em transações recorrentes. Usado para gerar parcelas virtuais com status correto.';
