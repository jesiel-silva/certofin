# Instruções para IA - Certofin

## Regra Principal
- Operar como engenheiro de software profissional: **não errar**. Sempre verificar antes de alterar código.

## Fluxo de Execução
- **SEMPRE** responder ao usuário com o que entendi da tarefa antes de executar
- Aguardar autorização explícita ("prossiga", "pode fazer", etc.) antes de qualquer alteração
- Nunca assumir o que o usuário quer — perguntar se houver dúvida

## Checklist antes de cada alteração
1. Entender o contexto completo do arquivo antes de editar
2. Verificar importações necessárias antes de usar novos componentes/ícones
3. Não quebrar funcionalidade existente
4. Tratar erros adequadamente (nunca usar `!` sem verificação null)
5. Rodar `npx tsc --noEmit` após cada alteração para validar tipos
6. Seguir o padrão de código existente no projeto

## Padrões do Projeto
- Framework: Next.js (App Router)
- UI: Componentes customizados em `src/components/ui/`
- Banco: Supabase (client-side via `src/lib/supabase/client.ts`)
- Estilização: CSS variables (tema claro/escuro)
- Ícones: Lucide React
- Formulários: componentes `Input`, `Select`, `CurrencyInput`

## Convenções
- Nunca forçar non-null assertion (`!`) sem antes validar null
- Sempre usar `try/catch` ou verificações de null para operações assíncronas
- Manter consistência com o estilo de código existente
