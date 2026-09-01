import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_CONFIG } from "@/lib/stripe/server";

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
    const priceId = STRIPE_CONFIG.priceIdPro;

    if (!priceId) {
      return NextResponse.json(
        { error: "ID do plano Stripe não configurado nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    // Buscar perfil do usuário no Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, full_name, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Se ainda não tiver customer_id no Stripe, criar ou vincular
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Salva o customer_id no perfil do usuário
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // URL base do app (suporta localhost e produção)
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // Criar a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${origin}/personal/planos?session_id={CHECKOUT_SESSION_ID}&checkout=success`,
      cancel_url: `${origin}/personal/planos?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Erro ao criar sessão de checkout Stripe:", error);
    const message = error instanceof Error ? error.message : "Erro interno ao processar pagamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
