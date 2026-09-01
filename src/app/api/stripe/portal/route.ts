import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    // Buscar o ID do cliente no Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Nenhum histórico de assinatura encontrado no Stripe para este usuário." },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // Criar a sessão do Portal do Cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/personal/planos`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    console.error("Erro ao criar sessão do Portal do Cliente Stripe:", error);
    const message = error instanceof Error ? error.message : "Erro ao abrir o portal de assinaturas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
