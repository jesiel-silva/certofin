import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  UserCheck,
  CreditCard,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Política de Privacidade - CertoFin",
  description: "Política de Privacidade do CertoFin em linguagem simples, transparente e sem juridiquês.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] antialiased text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--primary)]/30 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16 space-y-12">
        {/* Título Principal */}
        <div className="text-center space-y-4 border-b border-[var(--primary)]/20 pb-8">
          <div className="inline-flex items-center gap-2 border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--success)]">
            <ShieldCheck className="h-4 w-4" />
            <span>PROTEÇÃO DE DADOS GARANTIDA</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl text-white tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Política de Privacidade
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Aqui explicamos em <strong>linguagem simples e direta</strong> como cuidamos dos seus dados com total sigilo, sem termos difíceis ou letras escondidas.
          </p>
          <p className="text-xs font-mono text-[var(--primary)]">Última atualização: Setembro de 2026</p>
        </div>

        {/* Blocos da Política */}
        <div className="space-y-8">
          {/* Seção 1: Compromisso de Privacidade */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 border-l-4 border-l-[var(--success)]">
            <div className="flex items-center gap-3 text-[var(--success)]">
              <EyeOff className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                1. Nosso Compromisso com Você
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Seu dinheiro e suas informações financeiras são <strong>assunto exclusivamente seu</strong>. O CertoFin foi projetado com a filosofia de que seus dados pertencem unicamente a você. <strong>Nós NÃO vendemos, NÃO alugamos e NÃO compartilhamos</strong> suas informações com bancos, financeiras ou empresas de anúncios.
            </p>
          </section>

          {/* Seção 2: Quais dados coletamos */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <Database className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                2. Quais Dados Coletamos e Para Quê
              </h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-[var(--muted-foreground)]">
              <div className="space-y-1.5">
                <h3 className="font-bold text-[var(--foreground)] text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  Dados da Sua Conta:
                </h3>
                <p className="pl-6">Coletamos apenas o seu e-mail e nome para criar seu acesso seguro e permitir que você faça login no sistema.</p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-[var(--foreground)] text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  Lançamentos Financeiros:
                </h3>
                <p className="pl-6">Guardamos as receitas, despesas, categorias e datas que você cadastra no app. Esses dados são usados unicamente para montar seus relatórios e mostrar quanto você tem no caixa.</p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-[var(--foreground)] text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  Dados de Pagamento (Cartão):
                </h3>
                <p className="pl-6">Se você assinar o Plano Pro, o processamento do pagamento é feito diretamente pela infraestrutura segura do <strong>Stripe</strong>. Nós <strong>NUNCA guardamos o número do seu cartão de crédito</strong> em nossos servidores.</p>
              </div>
            </div>
          </section>

          {/* Seção 3: Como protegemos seus dados */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <Lock className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                3. Como Protegemos Suas Informações
              </h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <span><strong>Criptografia em trânsito e em repouso:</strong> Todas as comunicações entre seu dispositivo e o CertoFin são protegidas com criptografia de ponta (SSL/TLS).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <span><strong>Infraestrutura de Nível Bancário:</strong> Utilizamos o banco de dados do Supabase, com políticas rígidas de isolamento de dados (Row Level Security), garantindo que apenas você consiga visualizar suas movimentações.</span>
              </li>
            </ul>
          </section>

          {/* Seção 4: Seus Direitos e Exclusão */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--warning)]">
              <UserCheck className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                4. Seus Direitos: Controle Total
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Você tem total controle sobre suas informações. A qualquer momento você pode:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm sm:text-base text-[var(--muted-foreground)]">
              <li><strong>Editar ou apagar</strong> qualquer lançamento financeiro no aplicativo.</li>
              <li><strong>Excluir sua conta permanentemente:</strong> Ao solicitar a exclusão de conta nas configurações, todos os seus dados e históricos são removidos definitivamente de nossos bancos de dados.</li>
            </ul>
          </section>

          {/* Seção 5: Cookies */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <CreditCard className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                5. Uso de Cookies
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Utilizamos apenas <strong>cookies essenciais de sessão</strong> para manter você conectado com segurança enquanto navega pelo aplicativo. Não usamos cookies de rastreamento de publicidade nem vendemos histórico de navegação.
            </p>
          </section>

          {/* Seção 6: Suporte */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 border-l-4 border-l-[var(--primary)]">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <HelpCircle className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                6. Dúvidas sobre sua Privacidade?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Se você tiver qualquer dúvida sobre como seus dados são tratados no CertoFin, nossa equipe está à disposição na Central de Ajuda dentro do aplicativo ou pelo suporte.
            </p>
          </section>
        </div>

        {/* Botão de Ação Inferior */}
        <div className="text-center pt-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-none border border-[var(--primary)] bg-[var(--primary)]/10 px-8 py-4 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)] shadow-[0_0_15px_rgba(0,255,204,0.2)] hover:bg-[var(--primary)]/20 hover:shadow-[0_0_30px_rgba(0,255,204,0.4)] transition-all"
          >
            Entendido, Criar Minha Conta Segura
          </Link>
        </div>
      </main>

      {/* Footer Simples */}
      <footer className="border-t border-[var(--primary)]/20 bg-[#020617] py-6 text-center text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} CertoFin. Todos os direitos reservados.
      </footer>
    </div>
  );
}
