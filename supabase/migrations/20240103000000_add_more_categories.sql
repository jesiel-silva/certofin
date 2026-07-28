-- =============================================
-- CERTOFIN - MIGRAÇÃO: MAIS CATEGORIAS PADRÃO
-- =============================================

-- 1. Atualizar a função de categorias padrão
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

-- 2. Inserir novas categorias para TODOS os usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP

    -- Categorias de Negócio - Receita (apenas as novas)
    INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default)
    SELECT user_record.id, v.name, v.icon, v.color, v.scope, v.type, v.is_default
    FROM (VALUES
      ('Freelance', 'laptop', '#10b981', 'business', 'income', true),
      ('Consultoria', 'users', '#059669', 'business', 'income', true),
      ('Aluguel de Equipamentos', 'package', '#047857', 'business', 'income', true),
      ('Royalties e Licenças', 'file-text', '#065f46', 'business', 'income', true),
      ('Reembolsos', 'rotate-ccw', '#34d399', 'business', 'income', true)
    ) AS v(name, icon, color, scope, type, is_default)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.user_id = user_record.id AND c.name = v.name AND c.scope = 'business' AND c.type = 'income'
    );

    -- Categorias de Negócio - Despesa (apenas as novas)
    INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default)
    SELECT user_record.id, v.name, v.icon, v.color, v.scope, v.type, v.is_default
    FROM (VALUES
      ('Aluguel de Espaço', 'building', '#f87171', 'business', 'expense', true),
      ('Software e Sistemas', 'monitor', '#fca5a5', 'business', 'expense', true),
      ('Marketing e Publicidade', 'megaphone', '#dc2626', 'business', 'expense', true),
      ('Impostos e Taxas Governamentais', 'landmark', '#b91c1c', 'business', 'expense', true),
      ('Frete e Entrega', 'truck', '#ef4444', 'business', 'expense', true),
      ('Telefonia e Internet', 'phone', '#f87171', 'business', 'expense', true),
      ('Material de Escritório', 'pen-tool', '#dc2626', 'business', 'expense', true),
      ('Capacitação e Cursos', 'graduation-cap', '#b91c1c', 'business', 'expense', true),
      ('Profissionais e Terceirizados', 'users', '#991b1b', 'business', 'expense', true),
      ('Seguros', 'shield', '#ef4444', 'business', 'expense', true)
    ) AS v(name, icon, color, scope, type, is_default)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.user_id = user_record.id AND c.name = v.name AND c.scope = 'business' AND c.type = 'expense'
    );

    -- Categorias de Pessoal - Receita (apenas as novas)
    INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default)
    SELECT user_record.id, v.name, v.icon, v.color, v.scope, v.type, v.is_default
    FROM (VALUES
      ('Freelance Extra', 'laptop', '#60a5fa', 'personal', 'income', true),
      ('Presente / Doação', 'gift', '#93c5fd', 'personal', 'income', true),
      ('Dividendos e Investimentos', 'bar-chart', '#3b82f6', 'personal', 'income', true),
      ('Aluguel (Renda)', 'home', '#2563eb', 'personal', 'income', true),
      ('Venda de Item Pessoal', 'tag', '#1d4ed8', 'personal', 'income', true),
      ('Restituição / Reembolso', 'rotate-ccw', '#60a5fa', 'personal', 'income', true)
    ) AS v(name, icon, color, scope, type, is_default)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.user_id = user_record.id AND c.name = v.name AND c.scope = 'personal' AND c.type = 'income'
    );

    -- Categorias de Pessoal - Despesa (apenas as novas)
    INSERT INTO public.categories (user_id, name, icon, color, scope, type, is_default)
    SELECT user_record.id, v.name, v.icon, v.color, v.scope, v.type, v.is_default
    FROM (VALUES
      ('Saúde e Farmácia', 'heart-pulse', '#f97316', 'personal', 'expense', true),
      ('Educação', 'graduation-cap', '#ea580c', 'personal', 'expense', true),
      ('Vestuário', 'shirt', '#c2410c', 'personal', 'expense', true),
      ('Academia e Esportes', 'dumbbell', '#f97316', 'personal', 'expense', true),
      ('Assinaturas e Apps', 'credit-card', '#ea580c', 'personal', 'expense', true),
      ('Pet', 'paw-print', '#c2410c', 'personal', 'expense', true),
      ('Presentes', 'gift', '#f97316', 'personal', 'expense', true),
      ('Viagens', 'plane', '#ea580c', 'personal', 'expense', true),
      ('Eletroeletrônicos', 'smartphone', '#c2410c', 'personal', 'expense', true),
      ('Manutenção Residencial', 'home', '#f97316', 'personal', 'expense', true),
      ('Documentos e Impostos Pessoais', 'file-text', '#ea580c', 'personal', 'expense', true),
      ('Previdência e Investimentos', 'piggy-bank', '#c2410c', 'personal', 'expense', true),
      ('Outros', 'more-horizontal', '#92400e', 'personal', 'expense', false)
    ) AS v(name, icon, color, scope, type, is_default)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.user_id = user_record.id AND c.name = v.name AND c.scope = 'personal' AND c.type = 'expense'
    );

  END LOOP;
END $$;
