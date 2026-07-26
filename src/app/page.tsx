import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  BarChart3,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Wallet,
  PieChart,
  Split,
  Zap,
  Lock,
  Eye,
  Crown,
  ChevronRight,
  TrendingDown,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Split,
    title: "Dinheiro separado",
    description:
      "Não misture o dinheiro da sua empresa com o seu. O app separa tudo sozinho pra você nunca mais se perder.",
    bgColor: "bg-[#054388]/10 dark:bg-[#054388]/20",
    accentColor: "bg-[#054388]",
  },
  {
    icon: BarChart3,
    title: "Veja pra onde vai seu dinheiro",
    description:
      "Gráficos fáceis de entender mostram quanto você ganhou, quanto gastou e quanto sobrou. Tudo num lugar só.",
    bgColor: "bg-[#009B9E]/10 dark:bg-[#009B9E]/20",
    accentColor: "bg-[#009B9E]",
  },
  {
    icon: Shield,
    title: "Seu dinheiro tá seguro",
    description:
      "Ninguém além de você vê suas informações. Tudo protegido com a mesma segurança dos bancões.",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    accentColor: "bg-emerald-500",
  },
  {
    icon: Smartphone,
    title: "No celular ou no computador",
    description:
      "Acesse de qualquer lugar. Funciona igual no celular, no tablet e no computador.",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    accentColor: "bg-amber-500",
  },
];

const steps = [
  {
    step: "1",
    title: "Crie sua conta",
    description: "Leva 30 segundos. É só colocar seu e-mail e pronto.",
    icon: Zap,
  },
  {
    step: "2",
    title: "Anote o que entra e o que sai",
    description: "Coloque se é do trabalho ou pessoal. O app guarda tudo pra você.",
    icon: Wallet,
  },
  {
    step: "3",
    title: "Saiba quanto tá sobrando",
    description: "Veja na tela quanto você lucrou e quanto sobrou pra você.",
    icon: TrendingUp,
  },
];

const stats = [
  { number: "30", label: "Lançamentos grátis/mês" },
  { number: "24h", label: "Acesso livre" },
  { number: "R$29", label: "Plano Pro/mês" },
  { number: "🔒", label: "Seguro" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-200 via-gray-100 to-gray-50 antialiased transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 md:flex">
              <a
                href="#funcionalidades"
                className="group relative rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
              >
                <span className="relative z-10">Funcionalidades</span>
                <span className="absolute inset-0 rounded-xl bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/5" />
              </a>
              <a
                href="#como-funciona"
                className="group relative rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
              >
                <span className="relative z-10">Como funciona</span>
                <span className="absolute inset-0 rounded-xl bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/5" />
              </a>
              <a
                href="#planos"
                className="group relative rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
              >
                <span className="relative z-10">Planos</span>
                <span className="absolute inset-0 rounded-xl bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/5" />
              </a>
            </nav>
            <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-[#054388] via-[#0073BC] to-[#009B9E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#009B9E]/20 hover:shadow-xl hover:shadow-[#009B9E]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,155,158,0.06),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(5,67,136,0.06),transparent_50%)] pointer-events-none" />
        <div className="absolute top-20 left-1/4 h-[350px] w-[350px] rounded-full bg-[#009B9E]/10 blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-[#054388]/8 blur-[120px] animate-pulse pointer-events-none" />

        {/* Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[500px] w-[500px] opacity-[0.04]">
            <defs>
              <linearGradient id="wm-left-wing" x1="15" y1="45" x2="35" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0073BC" />
                <stop offset="100%" stopColor="#054388" />
              </linearGradient>
              <linearGradient id="wm-bottom-fold" x1="20" y1="70" x2="45" y2="55" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#031F44" />
                <stop offset="100%" stopColor="#005A9C" />
              </linearGradient>
              <linearGradient id="wm-arrow" x1="30" y1="80" x2="90" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#054388" />
                <stop offset="35%" stopColor="#0073BC" />
                <stop offset="70%" stopColor="#00A0E3" />
                <stop offset="100%" stopColor="#009B9E" />
              </linearGradient>
            </defs>
            <path d="M 12 55 L 26 69 L 38 57 L 24 43 Z" fill="url(#wm-left-wing)" />
            <path d="M 26 69 L 41 84 L 53 72 L 38 57 Z" fill="url(#wm-bottom-fold)" />
            <path d="M 33 76 L 73 36 L 68 31 L 90 22 L 90 44 L 85 39 L 45 79 Z" fill="url(#wm-arrow)" />
          </svg>
        </div>
        
        <div className="relative mx-auto max-w-6xl px-6 text-center z-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] backdrop-blur shadow-sm">
              <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
              <span>Plano grátis disponível • Pro por R$ 29,90/mês</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-7xl leading-tight">
              Pare de misturar o dinheiro
              <span className="block mt-2 bg-gradient-to-r from-[#054388] via-[#0073BC] to-[#009B9E] bg-clip-text text-transparent">
                da empresa com o seu
              </span>
            </h1>
            
            <p className="mt-8 text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl max-w-2xl mx-auto">
              Separe o que é do negócio do que é pessoal de um jeito automático e simples.
              Saiba exatamente quanto lucrou e quanto sobrou pra gastar com você.
            </p>
            
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#054388] via-[#0073BC] to-[#009B9E] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#009B9E]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#009B9E]/35 hover:-translate-y-1"
              >
                Quero organizar meu dinheiro
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 px-8 py-4 text-base font-bold text-[var(--foreground)] backdrop-blur transition-all duration-300 hover:border-[#009B9E]/40 hover:bg-white/90 dark:hover:bg-slate-900"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#009B9E]/30 hover:shadow-lg hover:shadow-[#009B9E]/5"
              >
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#009B9E]/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Premium Preview Mockup */}
          <div className="mx-auto mt-24 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-950/5 dark:shadow-[#009B9E]/5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="h-3.5 w-3.5 rounded-full bg-rose-500/80" />
              <div className="h-3.5 w-3.5 rounded-full bg-amber-500/80" />
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/80" />
              <div className="ml-4 rounded-lg bg-slate-100 dark:bg-slate-900 px-4 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                certofin.com.br/dashboard
              </div>
            </div>
            
            <div className="p-8 text-left">
              {/* Dashboard Header inside Mockup */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Seu Resumo Financeiro</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Visualização do app</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 p-1.5 border border-slate-200/50 dark:border-slate-800/50">
                  <Calendar className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Este Mês</span>
                </div>
              </div>

              {/* KPI Cards - Skeleton style */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Entradas</span>
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saídas</span>
                    <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo</span>
                    <div className="rounded-lg bg-[#009B9E]/10 p-2 text-[#009B9E]">
                      <PieChart className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">A Pagar</span>
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 lg:col-span-2">
                  <h4 className="mb-6 text-sm font-bold text-slate-800 dark:text-slate-200">Gráficos mensais</h4>
                  <div className="flex h-48 items-end gap-3 pb-2 pt-4">
                    {[40, 55, 35, 70, 50, 65, 45, 80, 60, 75, 55, 85].map((h, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col justify-end">
                        <div className="relative w-full rounded-md bg-[#009B9E]/20" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 w-full rounded-md bg-[#009B9E]/40 transition-all hover:bg-[#009B9E]/60" style={{ height: '100%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-xs font-semibold text-slate-400">
                    <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Set</span><span>Nov</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col justify-between">
                  <h4 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">Pessoal vs Negócio</h4>
                  <div className="flex flex-1 items-center justify-center py-4">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3.5" className="stroke-slate-100 dark:stroke-slate-900" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#009B9E" strokeWidth="3.5" strokeDasharray="50, 100" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#054388" strokeWidth="3.5" strokeDasharray="50, 100" strokeDashoffset="-50" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-400">50/50</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#009B9E]" />
                      <span className="text-slate-500">Pessoal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#054388]" />
                      <span className="text-slate-500">Negócio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="relative border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]">
              <Eye className="h-3.5 w-3.5 text-[#009B9E]" />
              <span>Funcionalidades Inteligentes</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-5xl leading-tight">
              Feito para facilitar a sua vida
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
              Simplificamos o controle do seu dinheiro. Sem planilhas complexas, sem perda de tempo.
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 p-8 transition-all duration-300 hover:border-[#009B9E]/30 hover:shadow-xl hover:shadow-[#009B9E]/5 hover:-translate-y-1"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${feature.bgColor}`}>
                  <feature.icon className="h-6 w-6 text-[#009B9E]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#009B9E]/5 transition-transform duration-350 group-hover:scale-150" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="como-funciona" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#009B9E]/5 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]">
              <Zap className="h-3.5 w-3.5 text-[#009B9E]" />
              <span>Simples e Rápido</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-5xl leading-tight">
              Comece em apenas 3 passos
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
              Você organiza tudo em menos de 1 minuto
            </p>
          </div>

          <div className="relative mt-20 grid gap-8 sm:grid-cols-3">
            {/* Step Connection Line */}
            <div className="absolute left-10 right-10 top-10 hidden h-0.5 bg-gradient-to-r from-[#054388]/10 via-[#009B9E]/40 to-[#009B9E]/10 sm:block pointer-events-none" />
            
            {steps.map((step, index) => (
              <div key={step.step} className="relative group text-center px-4">
                <div className="relative mx-auto mb-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#054388] to-[#009B9E] text-white shadow-lg shadow-[#009B9E]/25 transition-all duration-300 group-hover:scale-105">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-950 text-xs font-black text-[#009B9E] border-2 border-[#009B9E]">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden text-slate-300 dark:text-slate-800 sm:block">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-5xl leading-tight">
              Por que escolher o CertoFin?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
              Desenhado de ponta a ponta para fornecer segurança e clareza.
            </p>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 p-8 text-center transition-all hover:shadow-lg hover:border-emerald-500/20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sua privacidade garantida</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Suas informações são blindadas. Nós não temos e nunca teremos acesso aos seus dados financeiros confidenciais.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 p-8 text-center transition-all hover:shadow-lg hover:border-[#009B9E]/20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#009B9E]/10 text-[#009B9E] transition-transform group-hover:scale-105">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Agilidade e Sem Fricção</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Anote transações em poucos segundos de qualquer lugar. Interface mobile leve e focada na rapidez.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 p-8 text-center transition-all hover:shadow-lg hover:border-[#054388]/20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#054388]/10 text-[#054388] transition-transform group-hover:scale-105">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Relatórios Visuais</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Visualize na hora gráficos fáceis de ler que apontam gargalos de custos e mostram onde seu lucro está.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="relative border-t border-slate-200/50 dark:border-slate-800/50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-5xl leading-tight">
              Planos e Preços
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
              Comece sem gastar nada e aumente os recursos apenas quando o seu negócio pedir.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 transition-all hover:shadow-lg">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Plano Grátis</h3>
                  <p className="text-sm text-slate-400">Recursos fundamentais</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base text-slate-400">R$</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white">0</span>
                    <span className="text-sm text-slate-400 font-bold">/mês</span>
                  </div>
                </div>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Até 30 lançamentos por mês</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Controle financeiro pessoal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Agendamento de contas fixas</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                    <span className="text-sm text-slate-500 line-through">Separação de negócio/pessoal</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                    <span className="text-sm text-slate-500 line-through">Lançamentos parcelados</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-3.5 text-center text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-905"
              >
                Criar Conta Grátis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[#009B9E] bg-white dark:bg-slate-950 p-8 shadow-xl shadow-[#009B9E]/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#054388] to-[#009B9E] px-4 py-1 text-xs font-bold text-white shadow">
                  <Crown className="h-3.5 w-3.5" />
                  Mais Escolhido
                </div>
              </div>
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Plano Pro</h3>
                  <p className="text-sm text-[#009B9E] font-bold">Ideal para autônomos e freelancers</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base text-slate-400">R$</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white">29,90</span>
                    <span className="text-sm text-slate-400 font-bold">/mês</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Cobrança recorrente em cartão. Cancele quando quiser.</p>
                </div>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Lançamentos ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Negócios e Pessoal separados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Cálculo real de lucro operacional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Lançamentos parcelados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Dashboard avançado com gráficos</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#054388] via-[#0073BC] to-[#009B9E] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#009B9E]/20 transition-all hover:shadow-xl hover:shadow-[#009B9E]/30"
              >
                Assinar Plano Pro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#054388] via-[#0073BC] to-[#009B9E]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl leading-tight">
            Pronto para colocar as contas em ordem?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Crie sua conta em 30 segundos. Organize seu caixa e gaste o seu tempo no que realmente importa: crescer o seu negócio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>30 lançamentos grátis/mês</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/40 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>Pro ilimitado por R$ 29,90</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/40 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>Sem cartão para começar</span>
            </div>
          </div>
          <Link
            href="/signup"
            className="mt-12 inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-bold text-[#054388] shadow-2xl transition-all duration-300 hover:shadow-white/20 hover:-translate-y-1"
          >
            Começar agora mesmo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 transition-colors">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center">
                <Logo size="sm" />
              </Link>
              <p className="mt-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                A ferramenta mais simples e inteligente para separar as contas pessoais e corporativas de empreendedores individuais.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Produto</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="#funcionalidades" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Como funciona</Link></li>
                <li><Link href="#planos" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Preços</Link></li>
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Segurança</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Suporte</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Fale Conosco</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Legal</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Políticas de Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-100 dark:border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} CertoFin. Todos os direitos reservados.
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Feito com carinho para autônomos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
