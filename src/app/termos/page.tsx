import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  ShieldCheck,
  FileText,
  Lock,
  CreditCard,
  UserCheck,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Termos de Uso - CertoFin",
  description: "Termos de Uso do CertoFin em linguagem simples, transparente e fácil de entender.",
};

export default function TermosPage() {
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

      {/* Conteúdo dos Termos */}
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16 space-y-12">
        {/* Título Principal */}
        <div className="text-center space-y-4 border-b border-[var(--primary)]/20 pb-8">
          <div className="inline-flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)]">
            <FileText className="h-4 w-4" />
            <span>TRANSPARÊNCIA TOTAL</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl text-white tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Termos de Uso do CertoFin
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Escrevemos nossos termos em <strong>linguagem simples e direta</strong>, sem juridiquês ou letras miúdas, para que você saiba exatamente como o aplicativo funciona e como protegemos você.
          </p>
          <p className="text-xs font-mono text-[var(--primary)]">Última atualização: Setembro de 2026</p>
        </div>

        {/* Blocos dos Termos */}
        <div className="space-y-8">
          {/* Seção 1: O que é o CertoFin */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <ShieldCheck className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                1. O que é o CertoFin?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              O <strong>CertoFin</strong> é uma plataforma criada para ajudar autônomos, MEIs e pequenos empreendedores a organizar suas finanças. Nosso objetivo principal é te ajudar a <strong>separar o dinheiro da empresa do dinheiro pessoal</strong> de forma automática, clara e descomplicada.
            </p>
          </section>

          {/* Seção 2: Sua Conta e Segurança */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <UserCheck className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                2. Sua Conta e Suas Responsabilidades
              </h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <span><strong>Cadastro simples:</strong> Para usar o sistema, você precisa informar um e-mail válido e criar uma senha.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <span><strong>Guarde sua senha:</strong> Sua senha é pessoal. Não a compartilhe com terceiros. Tudo o que for feito dentro da sua conta é de sua responsabilidade.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                <span><strong>Dados corretos:</strong> Você se compromete a fornecer informações verdadeiras para que seu cadastro funcione corretamente.</span>
              </li>
            </ul>
          </section>

          {/* Seção 3: Privacidade dos Seus Dados */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 border-l-4 border-l-[var(--success)]">
            <div className="flex items-center gap-3 text-[var(--success)]">
              <Lock className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                3. Privacidade e Proteção do Seu Dinheiro
              </h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong>Seus dados são 100% SEUS.</strong> Nós respeitamos a sua privacidade acima de tudo.
              </p>
              <ul className="space-y-2 pl-4 list-disc text-sm sm:text-base">
                <li><strong>Não vendemos nem compartilhamos</strong> suas informações financeiras com bancos, financeiras ou anunciantes.</li>
                <li>Tudo o que você lança no aplicativo é criptografado com tecnologia de ponta (Supabase com certificação de segurança).</li>
                <li>Nossa equipe não tem acesso ao conteúdo dos seus extratos ou anotações financeiras pessoais.</li>
              </ul>
            </div>
          </section>

          {/* Seção 4: Planos e Pagamento */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--warning)]">
              <CreditCard className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                4. Planos, Cobrança e Cancelamento
              </h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-base">🌱 Plano Grátis:</h3>
                <p>Oferecemos 10 lançamentos mensais gratuitos sem prazo de validade. Você pode usar de graça pelo tempo que desejar.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-base">⚡ Plano Pro (R$ 9,90/mês):</h3>
                <p>Dá acesso ilimitado a todos os recursos. A cobrança é mensal e processada de forma 100% segura pelo Stripe.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-base">❌ Cancelamento sem complicação:</h3>
                <p>Você pode cancelar a assinatura Pro a qualquer momento direto pela página de planos no aplicativo. Não há fidelidade, multa ou pegadinha. Se cancelar, você continua com acesso Pro até o final do mês já pago.</p>
              </div>
            </div>
          </section>

          {/* Seção 5: Exclusão de Conta e Direitos */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <FileText className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                5. Exclusão de Conta e Encerramento
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Se a qualquer momento você desejar parar de usar o CertoFin, você pode optar por <strong>excluir sua conta permanentemente</strong> nas configurações. Ao fazer isso, todos os seus dados e históricos são apagados de nossos servidores imediatamente e de forma irreversível.
            </p>
          </section>

          {/* Seção 6: Suporte e Contato */}
          <section className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-4 border-l-4 border-l-[var(--primary)]">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <HelpCircle className="h-6 w-6 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                6. Dúvidas ou Suporte?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              Ficou com qualquer dúvida sobre estes termos ou precisa de ajuda com sua conta? Nossa equipe está pronta para te atender. Basta acessar a Central de Ajuda dentro do aplicativo ou entrar em contato pelo suporte.
            </p>
          </section>
        </div>

        {/* Botão de Ação Inferior */}
        <div className="text-center pt-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-none border border-[var(--primary)] bg-[var(--primary)]/10 px-8 py-4 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)] shadow-[0_0_15px_rgba(0,255,204,0.2)] hover:bg-[var(--primary)]/20 hover:shadow-[0_0_30px_rgba(0,255,204,0.4)] transition-all"
          >
            Entendido, Criar Minha Conta Grátis
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
