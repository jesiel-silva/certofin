-- =============================================
-- CERTOFIN - SCHEMA COMPLETO SUPABASE
-- SaaS de Finanças Pessoais e Negócios
-- =============================================

-- 1. TABELA DE PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ,
  trial_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABELA DE CATEGORIAS
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6366f1',
  scope TEXT NOT NULL CHECK (scope IN ('business', 'personal')),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TABELA DE TRANSACTIONS (LANÇAMENTOS)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  scope TEXT NOT NULL CHECK (scope IN ('business', 'personal')),
  frequency TEXT NOT NULL DEFAULT 'one_time'
    CHECK (frequency IN ('one_time', 'monthly', 'weekly', 'yearly', 'installment')),
  installment_current INTEGER,
  installment_total INTEGER,
  parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_scope ON public.transactions(scope);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- 5. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. CATEGORIAS PADRÃO POR ESCOPO
-- (serão inseridas via trigger quando o user se cadastrar)
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Categorias de Negócio - Receita
  INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default) VALUES
    (NEW.id, 'Serviços Prestados', 'briefcase', '#22c55e', 'business', 'income', true),
    (NEW.id, 'Vendas', 'shopping-cart', '#16a34a', 'business', 'income', true),
    (NEW.id, 'Comissões', 'percent', '#15803d', 'business', 'income', true),
    (NEW.id, 'Freelance', 'laptop', '#10b981', 'business', 'income', true),
    (NEW.id, 'Consultoria', 'users', '#059669', 'business', 'income', true),
    (NEW.id, 'Aluguel de Equipamentos', 'package', '#047857', 'business', 'income', true),
    (NEW.id, 'Royalties e Licenças', 'file-text', '#065f46', 'business', 'income', true),
    (NEW.id, 'Reembolsos', 'rotate-ccw', '#34d399', 'business', 'income', true);

  -- Categorias de Negócio - Despesa
  INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default) VALUES
    (NEW.id, 'Combustível', 'fuel', '#ef4444', 'business', 'expense', true),
    (NEW.id, 'Manutenção', 'wrench', '#dc2626', 'business', 'expense', true),
    (NEW.id, 'Insumos', 'package', '#b91c1c', 'business', 'expense', true),
    (NEW.id, 'Taxas e Tarifas', 'credit-card', '#991b1b', 'business', 'expense', true),
    (NEW.id, 'Aluguel de Espaço', 'building', '#f87171', 'business', 'expense', true),
    (NEW.id, 'Software e Sistemas', 'monitor', '#fca5a5', 'business', 'expense', true),
    (NEW.id, 'Marketing e Publicidade', 'megaphone', '#dc2626', 'business', 'expense', true),
    (NEW.id, 'Impostos e Taxas Governamentais', 'landmark', '#b91c1c', 'business', 'expense', true),
    (NEW.id, 'Frete e Entrega', 'truck', '#ef4444', 'business', 'expense', true),
    (NEW.id, 'Telefonia e Internet', 'phone', '#f87171', 'business', 'expense', true),
    (NEW.id, 'Material de Escritório', 'pen-tool', '#dc2626', 'business', 'expense', true),
    (NEW.id, 'Capacitação e Cursos', 'graduation-cap', '#b91c1c', 'business', 'expense', true),
    (NEW.id, 'Profissionais e Terceirizados', 'users', '#991b1b', 'business', 'expense', true),
    (NEW.id, 'Seguros', 'shield', '#ef4444', 'business', 'expense', true);

  -- Categorias de Pessoal - Receita
  INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default) VALUES
    (NEW.id, 'Salário', 'wallet', '#3b82f6', 'personal', 'income', true),
    (NEW.id, 'Pró-Labore', 'hand-coins', '#2563eb', 'personal', 'income', true),
    (NEW.id, 'Rendimentos', 'trending-up', '#1d4ed8', 'personal', 'income', true),
    (NEW.id, 'Freelance Extra', 'laptop', '#60a5fa', 'personal', 'income', true),
    (NEW.id, 'Presente / Doação', 'gift', '#93c5fd', 'personal', 'income', true),
    (NEW.id, 'Dividendos e Investimentos', 'bar-chart', '#3b82f6', 'personal', 'income', true),
    (NEW.id, 'Aluguel (Renda)', 'home', '#2563eb', 'personal', 'income', true),
    (NEW.id, 'Venda de Item Pessoal', 'tag', '#1d4ed8', 'personal', 'income', true),
    (NEW.id, 'Restituição / Reembolso', 'rotate-ccw', '#60a5fa', 'personal', 'income', true);

  -- Categorias de Pessoal - Despesa
  INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default) VALUES
    (NEW.id, 'Aluguel', 'home', '#f59e0b', 'personal', 'expense', true),
    (NEW.id, 'Luz', 'zap', '#d97706', 'personal', 'expense', true),
    (NEW.id, 'Água', 'droplets', '#b45309', 'personal', 'expense', true),
    (NEW.id, 'Supermercado', 'shopping-basket', '#92400e', 'personal', 'expense', true),
    (NEW.id, 'Internet', 'wifi', '#78350f', 'personal', 'expense', true),
    (NEW.id, 'Lazer', 'gamepad-2', '#451a03', 'personal', 'expense', true),
    (NEW.id, 'Transporte', 'car', '#fbbf24', 'personal', 'expense', true),
    (NEW.id, 'Saúde e Farmácia', 'heart-pulse', '#f97316', 'personal', 'expense', true),
    (NEW.id, 'Educação', 'graduation-cap', '#ea580c', 'personal', 'expense', true),
    (NEW.id, 'Vestuário', 'shirt', '#c2410c', 'personal', 'expense', true),
    (NEW.id, 'Academia e Esportes', 'dumbbell', '#f97316', 'personal', 'expense', true),
    (NEW.id, 'Assinaturas e Apps', 'credit-card', '#ea580c', 'personal', 'expense', true),
    (NEW.id, 'Pet', 'paw-print', '#c2410c', 'personal', 'expense', true),
    (NEW.id, 'Presentes', 'gift', '#f97316', 'personal', 'expense', true),
    (NEW.id, 'Viagens', 'plane', '#ea580c', 'personal', 'expense', true),
    (NEW.id, 'Eletroeletrônicos', 'smartphone', '#c2410c', 'personal', 'expense', true),
    (NEW.id, 'Manutenção Residencial', 'home', '#f97316', 'personal', 'expense', true),
    (NEW.id, 'Documentos e Impostos Pessoais', 'file-text', '#ea580c', 'personal', 'expense', true),
    (NEW.id, 'Previdência e Investimentos', 'piggy-bank', '#c2410c', 'personal', 'expense', true),
    (NEW.id, 'Outros', 'more-horizontal', '#92400e', 'personal', 'expense', false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_create_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();
