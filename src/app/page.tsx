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
  { number: "10", label: "Lançamentos grátis/mês" },
  { number: "24h", label: "Acesso livre" },
  { number: "R$9,90", label: "Plano Pro/mês" },
  { number: "🔒", label: "Seguro" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] antialiased transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--primary)]/30 bg-[#020617]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 md:flex">
              <a
                href="#funcionalidades"
                className="group relative px-4 py-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] transition-all hover:text-[var(--primary)]"
              >
                <span className="relative z-10">Funcionalidades</span>
                <span className="absolute inset-0 bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/10" />
              </a>
              <a
                href="#como-funciona"
                className="group relative px-4 py-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] transition-all hover:text-[var(--primary)]"
              >
                <span className="relative z-10">Como funciona</span>
                <span className="absolute inset-0 bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/10" />
              </a>
              <a
                href="#planos"
                className="group relative px-4 py-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] transition-all hover:text-[var(--primary)]"
              >
                <span className="relative z-10">Planos</span>
                <span className="absolute inset-0 bg-[var(--primary)]/0 transition-all group-hover:bg-[var(--primary)]/10" />
              </a>
            </nav>
            <div className="h-6 w-px bg-[var(--primary)]/30 hidden sm:block" />
            <Link
              href="/login"
              className="hidden text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors sm:block"
            >
              ENTRAR
            </Link>
            <Link
              href="/signup"
              className="rounded-none border border-[var(--primary)] bg-[var(--primary)]/10 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)] shadow-[0_0_15px_rgba(0,255,204,0.2)] hover:bg-[var(--primary)]/20 hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all duration-300"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 data-grid">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,204,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(255,0,51,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute top-20 left-1/4 h-[350px] w-[350px] rounded-full bg-[var(--primary)]/15 blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-[var(--destructive)]/10 blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/5 blur-[150px] pointer-events-none" />

        {/* Logo Watermark */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10%] flex items-center justify-center">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[600px] w-[600px] animate-watermark-pulse">
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
              <filter id="wm-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feFlood floodColor="#00ffcc" floodOpacity="0.3" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M 12 55 L 26 69 L 38 57 L 24 43 Z" fill="url(#wm-left-wing)" filter="url(#wm-glow)" />
            <path d="M 26 69 L 41 84 L 53 72 L 38 57 Z" fill="url(#wm-bottom-fold)" filter="url(#wm-glow)" />
            <path d="M 33 76 L 73 36 L 68 31 L 90 22 L 90 44 L 85 39 L 45 79 Z" fill="url(#wm-arrow)" filter="url(#wm-glow)" />
          </svg>
          </div>
        </div>
        
        <div className="relative mx-auto max-w-6xl px-6 text-center" style={{ zIndex: 10 }}>
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2.5 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-2 text-xs font-sans font-bold text-[var(--primary)] uppercase tracking-widest">
              <div className="h-2 w-2 bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]" />
              <span>SISTEMA ONLINE • PLANO GRÁTIS DISPONÍVEL</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Pare de misturar o dinheiro
              <span className="block mt-2 bg-gradient-to-r from-[var(--primary)] via-cyan-400 to-[var(--success)] bg-clip-text text-transparent text-glow-cyan">
                da empresa com o seu
              </span>
            </h1>
            
            <p className="mt-8 text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl lg:text-2xl max-w-2xl mx-auto">
              Separe o que é do negócio do que é pessoal de um jeito automático e simples.
              Saiba exatamente quanto lucrou e quanto sobrou pra gastar com você.
            </p>
            
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group btn-neon inline-flex items-center gap-2 rounded-none border border-[var(--primary)] bg-[var(--primary)]/10 px-8 py-4 text-sm font-sans font-bold uppercase tracking-widest text-[var(--primary)] shadow-[0_0_15px_rgba(0,255,204,0.2)] transition-all duration-300 hover:bg-[var(--primary)]/20 hover:shadow-[0_0_30px_rgba(0,255,204,0.4)]"
              >
                [ INICIAR_SISTEMA ]
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="btn-neon inline-flex items-center gap-2 rounded-none border border-[var(--border)] bg-transparent px-8 py-4 text-sm font-sans font-bold uppercase tracking-widest text-[var(--foreground)] transition-all duration-300 hover:border-[var(--primary)]/50 hover:bg-white/5"
              >
                &gt; ACESSAR_CONTA
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative overflow-hidden hud-border bg-[#0B1221]/80 p-6 backdrop-blur-md scanline-overlay animate-fade-in-up delay-${(index + 1) * 100}`}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white group-hover:scale-105 transition-transform duration-300 text-glow-cyan font-sans">
                  {stat.number}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {stat.label}
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--primary)]/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Premium Preview Mockup */}
          <div className="mx-auto mt-24 max-w-5xl overflow-hidden rounded-none hud-border bg-[#050B14]/90 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,204,0.1)]">
            <div className="flex items-center gap-2 border-b border-[var(--primary)]/30 px-6 py-3 bg-[#0B1221]">
              <div className="h-2 w-2 bg-[var(--destructive)] shadow-[0_0_5px_var(--destructive)]" />
              <div className="h-2 w-2 bg-[var(--warning)] shadow-[0_0_5px_var(--warning)]" />
              <div className="h-2 w-2 bg-[var(--success)] shadow-[0_0_5px_var(--success)]" />
              <div className="ml-4 flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-3 py-1">
                <Lock className="h-3 w-3 text-[var(--primary)]" />
                <span className="text-xs font-sans font-bold text-[var(--primary)] uppercase tracking-widest">
                  sys.certofin.com/dashboard
                </span>
              </div>
            </div>
            
            <div className="p-8 text-left">
              {/* Dashboard Header inside Mockup */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--primary)]/20 pb-4">
                <div>
                  <h3 className="text-sm font-bold font-sans text-[var(--primary)] uppercase tracking-widest text-glow-cyan" style={{ fontFamily: "var(--font-space-grotesk)" }}>TERMINAL DE CONTROLE</h3>
                  <p className="text-xs font-sans text-[var(--muted-foreground)] uppercase mt-1">STATUS: ONLINE | SYNC: 100%</p>
                </div>
                <div className="flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 glow-cyan">
                  <Calendar className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)]">ESTE MÊS</span>
                </div>
              </div>

              {/* KPI Cards - HUD style */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[
                  { label: "Entradas", color: "var(--success)", icon: TrendingUp },
                  { label: "Saídas", color: "var(--destructive)", icon: TrendingDown },
                  { label: "Saldo", color: "var(--primary)", icon: PieChart },
                  { label: "A Pagar", color: "var(--warning)", icon: Wallet }
                ].map((kpi, i) => (
                  <div key={i} className="hud-border bg-[#0B1221]/80 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[currentColor] to-transparent opacity-10" style={{ color: kpi.color }} />
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold font-sans uppercase tracking-widest text-[var(--muted-foreground)]">{kpi.label}</span>
                      <div className="p-1.5 border border-[currentColor]/30 bg-[currentColor]/10" style={{ color: kpi.color }}>
                        <kpi.icon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="h-6 w-24 bg-[currentColor]/20 animate-pulse border border-[currentColor]/30" style={{ color: kpi.color }} />
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="hud-border bg-[#0B1221]/80 p-6 lg:col-span-2">
                  <h4 className="mb-6 text-xs font-bold font-sans text-[var(--muted-foreground)] uppercase tracking-widest border-b border-white/5 pb-2">FLUXO DE CAIXA</h4>
                  <div className="flex h-48 items-end gap-3 pb-2 pt-4 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-[var(--primary)]" />)}
                    </div>
                    {[40, 55, 35, 70, 50, 65, 45, 80, 60, 75, 55, 85].map((h, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col justify-end z-10">
                        <div
                          className="relative w-full border border-[var(--primary)] bg-[var(--primary)]/20 hover:bg-[var(--primary)]/40 transition-colors origin-bottom"
                          style={{
                            height: `${h}%`,
                            animation: `barGrow 0.8s ease-out ${i * 0.08}s forwards`,
                            transform: 'scaleY(0)',
                          }}
                        >
                          <div className="absolute top-0 w-full h-1 bg-[var(--primary)] glow-cyan" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-xs font-bold font-sans text-[var(--primary)] opacity-60 uppercase">
                    <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Set</span><span>Nov</span>
                  </div>
                </div>

                <div className="hud-border bg-[#0B1221]/80 p-6 flex flex-col justify-between">
                  <h4 className="mb-4 text-xs font-bold font-sans text-[var(--muted-foreground)] uppercase tracking-widest border-b border-white/5 pb-2">DISTRIBUIÇÃO</h4>
                  <div className="flex flex-1 items-center justify-center py-4">
                    <div className="relative h-32 w-32 drop-shadow-[0_0_10px_var(--primary)]">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="2" opacity="0.3" />
                        <circle
                          cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="3"
                          strokeDasharray="50, 100"
                          style={{ animation: 'donutDraw 1.5s ease-out 0.3s forwards', strokeDashoffset: 100 }}
                        />
                        <circle
                          cx="18" cy="18" r="15.915" fill="none" stroke="var(--destructive)" strokeWidth="3"
                          strokeDasharray="50, 100" strokeDashoffset="-50"
                          style={{ animation: 'donutDraw 1.5s ease-out 0.6s forwards', strokeDashoffset: 150 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold font-sans text-[var(--foreground)]">50/50</span>
                        <span className="text-xs font-sans text-[var(--primary)]">RATIO</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-xs font-bold font-sans uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 bg-[var(--primary)] glow-cyan animate-pulse-glow" />
                      <span className="text-[var(--primary)]">PESSOAL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 bg-[var(--destructive)] glow-red animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                      <span className="text-[var(--destructive)]">NEGÓCIO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="relative border-t border-[var(--primary)]/20 bg-[#050B14] py-24 sm:py-32">
        <div className="absolute inset-0 data-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)]">
              <Eye className="h-3.5 w-3.5" />
              <span>MÓDULOS DE INTELIGÊNCIA</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              FEITO PARA FACILITAR A <span className="text-[var(--primary)] text-glow-cyan">SUA VIDA</span>
            </h2>
            <p className="mt-4 text-sm font-sans uppercase tracking-widest leading-relaxed text-[var(--muted-foreground)]">
              Simplificamos o controle do seu dinheiro. Sem planilhas complexas, sem perda de tempo.
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden hud-border bg-[#0B1221]/80 backdrop-blur-md p-8 scanline-overlay animate-fade-in-up delay-${(index + 1) * 100}`}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_var(--primary)]">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--primary)]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-sans leading-relaxed text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[var(--primary)]/20 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="como-funciona" className="relative py-24 sm:py-32 overflow-hidden border-t border-[var(--primary)]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)]">
              <Zap className="h-3.5 w-3.5" />
              <span>INICIALIZAÇÃO RÁPIDA</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              SISTEMA EM <span className="text-[var(--primary)] text-glow-cyan">3 PASSOS</span>
            </h2>
            <p className="mt-4 text-sm font-sans uppercase tracking-widest leading-relaxed text-[var(--muted-foreground)]">
              Sincronize seus dados em menos de 1 minuto
            </p>
          </div>

          <div className="relative mt-20 grid gap-8 sm:grid-cols-3">
            {/* Step Connection Line */}
            <div className="absolute left-10 right-10 top-10 hidden sm:block pointer-events-none">
              <div className="neon-line w-full" />
            </div>
            
            {steps.map((step, index) => (
              <div key={step.step} className={`relative group text-center px-4 animate-fade-in-up delay-${(index + 1) * 200}`}>
                <div className="relative mx-auto mb-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center border border-[var(--primary)]/50 bg-[#0B1221] text-[var(--primary)] shadow-[0_0_20px_rgba(0,255,204,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--primary)]/10 group-hover:shadow-[0_0_30px_rgba(0,255,204,0.3)]">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-[var(--primary)] text-xs font-sans font-black text-[#020617] shadow-[0_0_15px_var(--primary)]">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--primary)] text-glow-cyan">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-sans leading-relaxed text-[var(--muted-foreground)]">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden text-[var(--primary)]/50 sm:block">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative border-t border-[var(--primary)]/20 bg-[#0B1221]/50 py-24 sm:py-32">
        <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              POR QUE O <span className="text-[var(--primary)] text-glow-cyan">CERTOFIN?</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm font-sans uppercase tracking-widest leading-relaxed text-[var(--muted-foreground)]">
              Desenhado de ponta a ponta para fornecer segurança e clareza.
            </p>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <div className="group hud-border bg-[#0B1221]/80 p-8 text-center scanline-overlay animate-fade-in-up delay-100">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_var(--success)]">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--success)] text-glow-green">Sua privacidade garantida</h3>
              <p className="mt-3 text-sm font-sans leading-relaxed text-[var(--muted-foreground)]">
                Suas informações são blindadas. Nós não temos e nunca teremos acesso aos seus dados financeiros confidenciais.
              </p>
            </div>

            <div className="group hud-border bg-[#0B1221]/80 p-8 text-center scanline-overlay animate-fade-in-up delay-200">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_var(--primary)]">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--primary)] text-glow-cyan">Agilidade e Sem Fricção</h3>
              <p className="mt-3 text-sm font-sans leading-relaxed text-[var(--muted-foreground)]">
                Anote transações em poucos segundos de qualquer lugar. Interface mobile leve e focada na rapidez.
              </p>
            </div>

            <div className="group hud-border bg-[#0B1221]/80 p-8 text-center scanline-overlay animate-fade-in-up delay-300">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_var(--warning)]">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--warning)] text-glow-yellow">Relatórios Visuais</h3>
              <p className="mt-3 text-sm font-sans leading-relaxed text-[var(--muted-foreground)]">
                Visualize na hora gráficos fáceis de ler que apontam gargalos de custos e mostram onde seu lucro está.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="relative border-t border-[var(--primary)]/20 py-24 sm:py-32 bg-[#020617]">
        <div className="absolute inset-0 data-grid opacity-50 pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              PLANOS DE <span className="text-[var(--primary)] text-glow-cyan">ACESSO</span>
            </h2>
            <p className="mt-4 text-sm font-sans uppercase tracking-widest leading-relaxed text-[var(--muted-foreground)]">
              Comece sem gastar nada e aumente os recursos apenas quando o seu negócio pedir.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="flex flex-col justify-between hud-border bg-[#0B1221]/80 backdrop-blur-md p-8 transition-all hover:border-[var(--primary)]/50 scanline-overlay">
              <div>
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)]">NÍVEL 1: BÁSICO</h3>
                  <p className="text-xs sm:text-sm font-sans text-[var(--muted-foreground)]/60">Recursos fundamentais</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 font-sans">
                    <span className="text-base sm:text-lg text-[var(--primary)]/40">R$</span>
                    <span className="text-5xl sm:text-6xl font-black text-white">0</span>
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-[var(--primary)]/40 font-bold">/MÊS</span>
                  </div>
                </div>
                <ul className="mb-8 space-y-4 font-sans">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Até 10 lançamentos por mês</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Controle financeiro pessoal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Agendamento de contas fixas</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <Lock className="h-4 w-4 text-[var(--destructive)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--destructive)] line-through">Separação de negócio/pessoal</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <Lock className="h-4 w-4 text-[var(--destructive)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--destructive)] line-through">Lançamentos parcelados</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="block w-full border border-[var(--border)] bg-transparent py-3.5 text-center text-xs font-sans font-bold uppercase tracking-widest text-[var(--foreground)] transition-all hover:bg-white/5 hover:border-[var(--primary)]/50 hover:shadow-[0_0_15px_rgba(0,255,204,0.1)]"
              >
                CRIAR_CONTA_GRÁTIS
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between hud-border border-[var(--primary)] bg-[#0B1221] p-8 shadow-[0_0_25px_rgba(0,255,204,0.15)]">
              <div className="absolute inset-0 pointer-events-none z-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,204,0.05)_2px,rgba(0,255,204,0.05)_4px)]" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-1 border border-[var(--primary)] bg-[#0B1221] px-4 py-1 text-xs font-sans font-bold text-[var(--primary)] uppercase tracking-widest glow-cyan">
                  <Crown className="h-3 w-3" />
                  MAIS ESCOLHIDO
                </div>
              </div>
              <div>
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-sans font-bold uppercase tracking-widest text-[var(--primary)] text-glow-cyan">NÍVEL 2: PRO</h3>
                  <p className="text-xs sm:text-sm font-sans text-[var(--primary)]">Ideal para autônomos e freelancers</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 font-sans">
                    <span className="text-base sm:text-lg text-[var(--primary)]">R$</span>
                    <span className="text-5xl sm:text-6xl font-black text-white text-glow-cyan">9,90</span>
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-[var(--primary)] font-bold">/MÊS</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-sans uppercase tracking-widest text-[var(--muted-foreground)]">Cobrança recorrente em cartão. Cancele quando quiser.</p>
                </div>
                <ul className="mb-8 space-y-4 font-sans">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Lançamentos ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Negócios e Pessoal separados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Lançamentos parcelados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Dashboard avançado com gráficos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-foreground)]">14 dias de trial grátis</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full border border-[var(--primary)] bg-[var(--primary)]/10 py-3.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)] transition-all hover:bg-[var(--primary)]/20 hover:shadow-[0_0_25px_rgba(0,255,204,0.3)]"
              >
                ASSINAR_PLANO_PRO
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 border-t border-[var(--primary)]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1221] to-[#020617]" />
        <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(0,255,204,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            PRONTO PARA INICIAR A <span className="text-[var(--primary)] text-glow-cyan">OPERAÇÃO?</span>
          </h2>
          <p className="mt-6 text-sm font-sans uppercase tracking-widest text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Crie sua conta em 30 segundos. Organize seu caixa e gaste o seu tempo no que realmente importa: crescer o seu negócio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
              <span>10 lançamentos grátis/mês</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-none bg-[var(--primary)]/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
              <span>Pro ilimitado por R$ 9,90</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-none bg-[var(--primary)]/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
              <span>Sem cartão para começar</span>
            </div>
          </div>
          <Link
            href="/signup"
            className="mt-12 btn-neon inline-flex items-center gap-2 border border-[var(--primary)] bg-[var(--primary)]/10 px-10 py-4 text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)]/20 hover:shadow-[0_0_40px_rgba(0,255,204,0.4)]"
          >
            [ COMEÇAR AGORA MESMO ]
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--primary)]/20 bg-[#020617]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center">
                <Logo size="sm" />
              </Link>
              <p className="mt-4 text-[10px] font-sans uppercase tracking-widest leading-normal text-[var(--muted-foreground)]">
                A ferramenta mais simples e inteligente para separar as contas pessoais e corporativas de empreendedores individuais.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[var(--primary)]">Produto</h4>
              <ul className="mt-2 space-y-1.5">
                <li><Link href="#como-funciona" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Como funciona</Link></li>
                <li><Link href="#planos" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Preços</Link></li>
                <li><Link href="/login" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Segurança</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[var(--primary)]">Suporte</h4>
              <ul className="mt-2 space-y-1.5">
                <li><Link href="/login" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/login" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Fale Conosco</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[var(--primary)]">Legal</h4>
              <ul className="mt-2 space-y-1.5">
                <li><Link href="/login" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Termos de Uso</Link></li>
                <li><Link href="/login" className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Políticas de Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-[var(--primary)]/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} CertoFin. Todos os direitos reservados.
            </p>
            <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--primary)] font-bold text-glow-cyan pulse-dot">
              SYS.STATUS = [ OPERATIONAL ]
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
