-- Adicionar colunas para transações recorrentes
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_active BOOLEAN DEFAULT TRUE;

-- Criar índice para查询 performance
CREATE INDEX IF NOT EXISTS idx_transactions_recurring 
ON transactions(is_recurring, recurring_active) 
WHERE is_recurring = TRUE;

-- Comentários para documentação
COMMENT ON COLUMN transactions.due_day IS 'Dia do mês para transações recorrentes (1-31)';
COMMENT ON COLUMN transactions.is_recurring IS 'TRUE = template de transação recorrente (não aparece diretamente)';
COMMENT ON COLUMN transactions.recurring_active IS 'TRUE = recorrência ativa, FALSE = pausada';
