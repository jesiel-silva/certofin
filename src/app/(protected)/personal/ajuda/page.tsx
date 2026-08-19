"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  Bell,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Tag,
  Calendar,
  Repeat,
  Shield,
  Mail,
  Trash2,
  Crown,
  Home,
  Briefcase,
  FileText,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  icon?: typeof HelpCircle;
}

interface GuideSection {
  id: string;
  title: string;
  icon: typeof User;
  content: GuideContent[];
}

interface GuideContent {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  warning?: string;
  link?: string;
  linkLabel?: string;
}

const guideSections: GuideSection[] = [
  {
    id: "perfil",
    title: "Perfil e Conta",
    icon: User,
    content: [
      {
        title: "Como acessar meu perfil?",
        description:
          'Clique no seu nome ou nas iniciais na parte inferior da barra lateral (sidebar) e você será redirecionado para a página de "Perfil e Ajustes".',
      },
      {
        title: "Como alterar meu nome?",
        description:
          'Na página "Perfil e Ajustes", localize o campo "Nome completo", digite seu novo nome e clique em "Salvar Perfil".',
      },
      {
        title: "Como trocar minha foto de perfil (avatar)?",
        description:
          'Clique no botão "Enviar foto" ou "Trocar foto" ao lado do seu avatar. Selecione uma imagem do seu computador (máximo 2MB, formatos PNG ou JPG). Sua foto será salva automaticamente.',
        tips: [
          "A imagem deve ter no máximo 2MB",
          "Aceita formatos PNG, JPG e outros tipos de imagem",
          "Se não enviar uma foto, suas iniciais serão exibidas no lugar",
        ],
      },
      {
        title: "Como alterar meu e-mail?",
        description:
          'Na seção "E-mail de acesso", digite o novo e-mail e clique em "Alterar e-mail". Você receberá um link de confirmação no novo endereço. O e-mail só será atualizado após a confirmação.',
      },
      {
        title: "Como alterar minha senha?",
        description:
          'Na seção "Senha", digite a nova senha (mínimo 6 caracteres), confirme e clique em "Alterar senha". A alteração é imediata.',
        tips: [
          "A senha deve ter pelo menos 6 caracteres",
          "Use uma combinação de letras, números e símbolos",
          "Evite usar senhas fáceis de adivinhar",
        ],
      },
      {
        title: "Como excluir minha conta?",
        description:
          'Role a página de "Perfil e Ajustes" até a seção "Zona de Perigo". Clique em "Excluir minha conta permanentemente". Esta ação é irreversível e todos os seus dados serão apagados.',
        warning:
          "Atenção: Ao excluir sua conta, todos os seus lançamentos, categorias, histórico e configurações serão permanentemente removidos. Esta ação não pode ser desfeita.",
      },
    ],
  },
  {
    id: "receitas",
    title: "Criar Receitas",
    icon: ArrowDownLeft,
    content: [
      {
        title: "O que é uma receita?",
        description:
          "Uma receita é todo valor que entra no seu bolso. Exemplos: salário, freelances, vendas, rendimentos de investimentos, reembolsos, etc.",
      },
      {
        title: "Como criar uma nova receita?",
        description:
          "Siga estes passos para registrar uma receita:",
        steps: [
          "Clique em \"Registrar Lançamento\" na barra lateral ou no botão \"Receita\" no dashboard",
          'Selecione o escopo: "Pessoal" (finanças pessoais) ou "Negócio" (finanças do negócio)',
          'Selecione o tipo: "Receita"',
          "Preencha a descrição (ex: Salário, Freelance)",
          "Informe o valor em reais (R$)",
          "Escolha a data do recebimento",
          "Selecione uma categoria (opcional)",
          'Escolha a frequência: "Único" (uma vez) ou "Recorrente" (todo mês)',
          'Se for recorrente, escolha o dia do vencimento (ex: dia 5 de cada mês)',
          "Adicione observações se necessário (opcional)",
          'Clique em "Criar Lançamento"',
        ],
        tips: [
          "Use descrições claras para facilitar a identificação depois",
          "Categorias ajudam a organizar e gerar relatórios precisos",
          "Lançamentos recorrentes são ideais para salários e receitas fixas mensais",
        ],
      },
      {
        title: "Receita Única vs Recorrente",
        description:
          "Receita Única: é registrada uma única vez, para um dia específico. Receita Recorrente: é criada uma vez e aparece automaticamente todo mês no dia escolhido, sem precisar criar de novo.",
        tips: [
          "Lançamentos recorrentes são um recurso do Plano Pro",
          "No plano grátis, você pode criar até 10 lançamentos por mês",
        ],
      },
      {
        title: "Como marcar uma receita como paga?",
        description:
          'Quando você cria um lançamento, ele começa como "Pendente". Para marcar como pago, abra o lançamento na lista e altere o status. Apenas lançamentos "Pagos" são contabilizados no dashboard.',
      },
    ],
  },
  {
    id: "despesas",
    title: "Criar Despesas",
    icon: ArrowUpRight,
    content: [
      {
        title: "O que é uma despesa?",
        description:
          "Uma despesa é todo valor que sai do seu bolso. Exemplos: contas de luz, aluguel, mercado, transporte, assinaturas, etc.",
      },
      {
        title: "Como criar uma nova despesa?",
        description:
          "Siga estes passos para registrar uma despesa:",
        steps: [
          'Clique em "Registrar Lançamento" na barra lateral ou no botão "Despesa" no dashboard',
          'Selecione o escopo: "Pessoal" ou "Negócio"',
          'Selecione o tipo: "Despesa"',
          "Preencha a descrição (ex: Conta de luz, Aluguel)",
          "Informe o valor em reais (R$)",
          "Escolha a data de vencimento",
          "Selecione uma categoria (opcional)",
          'Escolha a frequência: "Único" ou "Recorrente"',
          'Se for recorrente, escolha o dia do vencimento',
          "Adicione observações se necessário",
          'Clique em "Criar Lançamento"',
        ],
        tips: [
          "Organize suas despesas por categorias para ter gráficos precisos",
          "Use o campo de observações para detalhes importantes (ex: número da conta)",
          "Despesas recorrentes são perfeitas para aluguel, internet,-streaming, etc.",
        ],
      },
      {
        title: "Como editar ou excluir uma despesa?",
        description:
          'Na página de "Lançamentos", clique no lançamento que deseja alterar. Você pode editar todos os campos ou excluí-lo clicando no ícone de lixeira. Confirme a exclusão quando solicitado.',
        warning:
          "A exclusão de um lançamento é permanente e não pode ser desfeita.",
      },
    ],
  },
  {
    id: "categorias",
    title: "Categorias",
    icon: Tag,
    content: [
      {
        title: "O que são categorias?",
        description:
          "Categorias são etiquetas que ajudam a organizar seus lançamentos. Cada lançamento pode ter uma categoria associada, o que permite gerar relatórios e gráficos detalhados.",
      },
      {
        title: "Como criar uma nova categoria?",
        description:
          "Ao criar ou editar um lançamento, clique no campo \"Categoria\" e selecione \"+ Criar nova categoria\". Escolha um nome, um ícone e uma cor. Clique em \"Criar Categoria\".",
        steps: [
          "Abra o formulário de lançamento",
          'No campo "Categoria", selecione "+ Criar nova categoria"',
          "Digite o nome da categoria",
          "Escolha um ícone que represente a categoria",
          "Selecione uma cor",
          'Clique em "Criar Categoria"',
        ],
        tips: [
          "Crie categorias específicas para análises mais precisas",
          "Cada categoria é vinculada a um escopo (Pessoal ou Negócio) e tipo (Receita ou Despesa)",
        ],
      },
      {
        title: "Como editar uma categoria?",
        description:
          'Selecione a categoria no campo "Categoria" do lançamento. Clique no ícone de editar (lápis) ao lado. Altere o nome, ícone ou cor e clique em "Salvar Alterações".',
      },
      {
        title: "Como excluir uma categoria?",
        description:
          'Selecione a categoria no campo "Categoria". Clique no ícone de excluir (lixeira). Confirme a exclusão. Os lançamentos vinculados ficarão sem categoria.',
      },
    ],
  },
  {
    id: "escopos",
    title: "Escopos: Pessoal e Negócio",
    icon: Home,
    content: [
      {
        title: "O que é o escopo Pessoal?",
        description:
          "O escopo Pessoal é para suas finanças pessoais. Use para registrar seu salário, gastos do dia a dia, contas pessoais, etc. Está disponível em todos os planos.",
      },
      {
        title: "O que é o escopo Negócio?",
        description:
          "O escopo Negócio é para as finanças do seu negócio ou empresa. Use para registrar vendas, custos de operação, lucros, etc. Este recurso é exclusivo do Plano Pro.",
        tips: [
          "O escopo Negócio requer o Plano Pro ou Trial ativo",
          "As categorias do Negócio são separadas das do Pessoal",
          "Os gráficos e relatórios consideram ambos os escopos",
        ],
      },
      {
        title: "Como alternar entre os escopos?",
        description:
          'No formulário de lançamento, use as abas "Pessoal" e "Negócio" na parte superior. Na sidebar, os lançamentos de cada escopo estão em seções separadas.',
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    content: [
      {
        title: "O que mostra o Dashboard?",
        description:
          "O Dashboard é a tela principal que mostra um resumo completo das suas finanças. Ele exibe:",
        steps: [
          "Indicadores (KPIs) com totais de receitas e despesas",
          "Saldos pendentes (lançamentos ainda não pagos)",
          "Gráfico de despesas por categoria",
          "Gráfico de evolução mensal (receitas vs despesas)",
          "Comparativo entre meses",
        ],
      },
      {
        title: "Como trocar o mês exibido?",
        description:
          'Use o seletor de mês no canto superior direito do dashboard. Você pode navegar entre os últimos 12 meses e os próximos 3 meses.',
      },
      {
        title: "O que significam os cards de indicadores (KPIs)?",
        description:
          "Os cards mostram: Receitas Pessoais (valor total de entradas pessoais pagas), Despesas Pessoais (valor total de saídas pessoais pagas), Receitas do Negócio e Despesas do Negócio (apenas para Plano Pro). Valores pendentes aparecem separadamente.",
      },
    ],
  },
  {
    id: "lancamentos",
    title: "Gerenciar Lançamentos",
    icon: FileText,
    content: [
      {
        title: "Como ver todos os meus lançamentos?",
        description:
          'Clique em "Lançamentos" na barra lateral (sidebar). Você verá uma lista completa com todos os seus lançamentos, organizados por data.',
        link: "/personal/transactions",
        linkLabel: "Ir para Lançamentos",
      },
      {
        title: "Como filtrar lançamentos?",
        description:
          "Na página de lançamentos, use os filtros disponíveis para buscar por descrição, tipo (receita/despesa), status (pago/pendente), período e categoria.",
      },
      {
        title: "Como editar um lançamento?",
        description:
          'Clique no lançamento que deseja alterar na lista. Será aberto o formulário de edição com todos os campos preenchidos. Faça as alterações necessárias e clique em "Salvar Alterações".',
      },
      {
        title: "Como excluir um lançamento?",
        description:
          'Abra o lançamento para edição. Clique no ícone de lixeira no canto superior direito. Confirme a exclusão. Esta ação é permanente.',
      },
      {
        title: "O que é um lançamento recorrente?",
        description:
          "Um lançamento recorrente é aquele que se repete automaticamente todo mês. Ao criar um lançamento com frequência \"Recorrente\", ele aparecerá automaticamente no mês seguinte e nos meses seguintes, sem precisar criar de novo.",
        tips: [
          "Lançamentos recorrentes são uma feature do Plano Pro",
          "Você pode pausar ou editar um lançamento recorrente a qualquer momento",
          "Ao marcar como pago, o lançamento do próximo mês é criado automaticamente",
        ],
      },
      {
        title: "Qual a diferença entre Pago e Pendente?",
        description:
          "Pago: o valor já foi recebido ou pago. Apenas lançamentos pagos são contabilizados nos totais do dashboard. Pendente: o valor ainda não foi movimentado. Aparece como saldo pendente no dashboard.",
      },
    ],
  },
  {
    id: "notificacoes",
    title: "Notificações",
    icon: Bell,
    content: [
      {
        title: "O que são as notificações?",
        description:
          "As notificações são alertas automáticos do sistema. Elas informam sobre lançamentos vencidos, vencendo em breve, comparativos de gastos entre meses e avisos do sistema.",
      },
      {
        title: "Tipos de notificações",
        description: "Existem diferentes tipos de notificações que você pode receber:",
        steps: [
          "Vencida (vermelho): lançamento com data de pagamento já passada",
          "Vencendo (amarelo): lançamento que vencerá nos próximos dias",
          "Comparativo (ciano): alertas sobre mudanças nos seus gastos",
          "Sistema (cinza): avisos gerais do sistema",
        ],
      },
      {
        title: "Como acessar as notificações?",
        description:
          'Clique no ícone de sino no cabeçalho ou em "Notificações" na barra lateral. Você pode filtrar entre todas as notificações e não lidas.',
      },
      {
        title: "Como limpar notificações?",
        description:
          'Na página de notificações, clique em "Limpar todas" para remover todas as notificações. Você também pode excluir notificações individualmente passando o mouse sobre elas.',
      },
    ],
  },
  {
    id: "planos",
    title: "Planos e Assinatura",
    icon: Crown,
    content: [
      {
        title: "Quais planos estão disponíveis?",
        description: "O CertoFin oferece dois planos para atender suas necessidades:",
        steps: [
          "Plano Grátis: até 10 lançamentos por mês, escopo pessoal, dashboard básico",
          "Plano Pro: lançamentos ilimitados, escopo negócio, lançamentos recorrentes, relatórios avançados, comparativos",
        ],
      },
      {
        title: "Como funciona o Trial PRO?",
        description:
          'O Trial PRO oferece 14 dias de acesso gratuito a todos os recursos do plano Pro. Clique em "Testar PRO grátis por 14 dias" na página de Planos. O trial pode ser ativado apenas uma vez por conta.',
      },
      {
        title: "Como funciona o limite de lançamentos no plano grátis?",
        description:
          "No plano grátis, você pode criar até 10 lançamentos por mês calendário. No início de cada mês, o contador é resetado. Se atingir o limite, você precisará aguardar o próximo mês ou fazer upgrade para o Pro.",
      },
      {
        title: "Como cancelar minha assinatura?",
        description:
          'Na página de "Perfil e Ajustes" ou "Planos", clique em "Cancelar assinatura / plano atual". Você será direcionado para uma pesquisa de cancelamento. O acesso ao plano Pro continua até o final do período já pago.',
      },
      {
        title: "Como acessar a página de planos?",
        description:
          'Clique em "Gerenciar plano" na página de Perfil e Ajustes ou acesse pela barra lateral.',
        link: "/personal/planos",
        linkLabel: "Ir para Planos",
      },
    ],
  },
  {
    id: "seguranca",
    title: "Segurança",
    icon: Shield,
    content: [
      {
        title: "Meus dados estão seguros?",
        description:
          "Sim! Todos os dados são armazenados de forma segura no Supabase (banco de dados baseado em PostgreSQL). As conexões são criptografadas e seguimos as melhores práticas de segurança.",
      },
      {
        title: "Dicas de segurança",
        description: "Siga estas práticas para manter sua conta segura:",
        steps: [
          "Use uma senha forte com pelo menos 6 caracteres",
          "Não compartilhe suas credenciais de acesso",
          "Altere sua senha periodicamente",
          "Se suspeitar que sua conta foi comprometida, altere a senha imediatamente",
        ],
      },
    ],
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Esqueci minha senha, como recupero?",
    answer:
      'Na tela de login, clique em "Esqueci minha senha". Você receberá um link de recuperação no seu e-mail. Clique no link e defina uma nova senha.',
    icon: Shield,
  },
  {
    question: "Posso usar o CertoFin no celular?",
    answer:
      "Sim! O CertoFin funciona em qualquer dispositivo com navegador web (celular, tablet ou computador). Basta acessar o site e fazer login.",
    icon: HelpCircle,
  },
  {
    question: "Como exportar meus dados para um relatório?",
    answer:
      'Na página de "Lançamentos", use o botão de exportar para gerar um arquivo PDF com todos os seus lançamentos filtrados.',
    icon: BarChart3,
  },
  {
    question: "Posso ter contas separadas para pessoa física e jurídica?",
    answer:
      "Sim! Use o escopo \"Pessoal\" para suas finanças pessoais e \"Negócio\" para as finanças do seu negócio. As categorias e relatórios são separados para cada escopo.",
    icon: Briefcase,
  },
  {
    question: "O que acontece com meus dados se eu cancelar o plano?",
    answer:
      "Seus dados permanecem no sistema. Ao cancelar o plano Pro, você volta para o plano grátis com o limite de 10 lançamentos por mês. Seus lançamentos antigos continuam acessíveis.",
    icon: CreditCard,
  },
  {
    question: "Como alterar o idioma do sistema?",
    answer:
      "No momento, o CertoFin está disponível apenas em português brasileiro. Estamos trabalhando para adicionar outros idiomas no futuro.",
    icon: Settings,
  },
  {
    question: "Posso importar dados de outros aplicativos?",
    answer:
      "No momento, não há importação automática. Você pode registrar seus lançamentos manualmente. Estamos trabalhando em recursos de importação.",
    icon: FileText,
  },
  {
    question: "Como funcionam os lançamentos recorrentes?",
    answer:
      'Ao criar um lançamento com frequência "Recorrente", ele se repete automaticamente todo mês no dia escolhido. Ao marcar como pago, o sistema cria automaticamente o lançamento do próximo mês. Disponível apenas no Plano Pro.',
    icon: Repeat,
  },
  {
    question: "Qual a diferença entre pagamento e vencimento?",
    answer:
      'A "data" do lançamento é a data de vencimento/referência. O "status" (Pago ou Pendente) indica se o valor já foi movimentado. Um lançamento pode estar pendente mesmo após a data de vencimento.',
    icon: Calendar,
  },
  {
    question: "Posso criar categorias personalizadas?",
    answer:
      "Sim! Ao criar um lançamento, selecione \"+ Criar nova categoria\" no campo de categorias. Você pode definir nome, ícone e cor. Cada categoria é vinculada a um escopo e tipo.",
    icon: Tag,
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon || HelpCircle;

  return (
    <div
      className={cn(
        "border rounded-lg transition-all duration-200",
        isOpen
          ? "border-[var(--primary)]/30 bg-[var(--primary)]/5"
          : "border-[var(--border)] hover:border-[var(--primary)]/20"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <span className="flex-1 text-base font-medium text-[var(--foreground)]">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="ml-11 text-base text-[var(--muted-foreground)] leading-relaxed">
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
}

function GuideSectionCard({ section }: { section: GuideSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = section.icon;

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        <CardHeader className="cursor-pointer hover:bg-[var(--accent)]/30 transition-colors">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <Icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <span className="flex-1 text-left">{section.title}</span>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
            )}
          </CardTitle>
        </CardHeader>
      </button>
      {isOpen && (
        <CardContent className="space-y-6 border-t border-[var(--border)]">
          {section.content.map((item, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="text-base text-[var(--muted-foreground)] leading-relaxed">
                {item.description}
              </p>

              {item.steps && (
                <ol className="space-y-2 ml-1">
                  {item.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-base text-[var(--muted-foreground)]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)] mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {item.tips && (
                <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/5 p-3">
                  <p className="text-xs font-semibold text-[var(--success)] mb-2 uppercase tracking-wider">
                    Dicas
                  </p>
                  <ul className="space-y-1">
                    {item.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-base text-[var(--muted-foreground)]">
                        <span className="text-[var(--success)] mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.warning && (
                <div className="rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/5 p-3">
                  <p className="text-base text-[var(--warning)]">
                    ⚠ {item.warning}
                  </p>
                </div>
              )}

              {item.link && (
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  {item.linkLabel || "Ir para a página"} →
                </Link>
              )}

              {index < section.content.length - 1 && (
                <div className="border-b border-[var(--border)]" />
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export default function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guia" | "faq">("guia");

  const filteredSections = guideSections
    .map((section) => ({
      ...section,
      content: section.content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (section) =>
        section.content.length > 0 ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/personal/dashboard"
          className="rounded-lg p-1 hover:bg-[var(--accent)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-[var(--primary)]" />
            Central de Ajuda
          </h1>
          <p className="text-base text-[var(--muted-foreground)]">
            Tudo o que você precisa saber para usar o CertoFin
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Buscar por palavra-chave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-12 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("guia")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "guia"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
              : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] border border-transparent"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Guias Completos
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "faq"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
              : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] border border-transparent"
          )}
        >
          <HelpCircle className="h-4 w-4" />
          Perguntas Frequentes
        </button>
      </div>

      {/* Content */}
      {activeTab === "guia" ? (
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-[var(--muted-foreground)]/30" />
                <p className="mt-4 text-lg font-medium text-[var(--foreground)]">
                  Nenhum resultado encontrado
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Tente buscar com outras palavras-chave
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSections.map((section) => (
              <GuideSectionCard key={section.id} section={section} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaq.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-[var(--muted-foreground)]/30" />
                <p className="mt-4 text-lg font-medium text-[var(--foreground)]">
                  Nenhuma pergunta encontrada
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Tente buscar com outras palavras-chave
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFaq.map((item, index) => (
              <FaqAccordion key={index} item={item} />
            ))
          )}
        </div>
      )}

      {/* Contact Support */}
      <Card className="border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
        <CardContent className="py-6 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-3">
            <Mail className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Ainda precisa de ajuda?
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Se não encontrou o que procurava, entre em contato com nosso suporte.
          </p>
          <a
            href="mailto:suporte@certofin.com.br"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-6 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
          >
            <Mail className="h-4 w-4" />
            suporte@certofin.com.br
          </a>
        </CardContent>
      </Card>
    </div>
  );
}