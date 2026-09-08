import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import Stripe from "stripe";

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

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.session_id;

    const stripe = getStripe();

    let customerId: string | null = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      if (session.mode !== "subscription") {
        return NextResponse.json(
          { error: "A sessão informada não é de uma assinatura recorrente." },
          { status: 400 }
        );
      }

      customerId = session.customer as string;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      customerId = profile?.stripe_customer_id ?? null;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Nenhum cliente de assinatura encontrado para este usuário." },
        { status: 400 }
      );
    }

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
      status: "all",
    });

    const activeSub = subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    const supabaseAdmin = createAdminClient();

    if (activeSub) {
      const currentPeriodEnd = (activeSub as unknown as { current_period_end?: number }).current_period_end
        ? new Date((activeSub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "pro",
          stripe_customer_id: customerId,
          stripe_subscription_id: activeSub.id,
          stripe_price_id: activeSub.items.data[0]?.price.id ?? null,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: activeSub.cancel_at_period_end,
        })
        .eq("id", user.id);

      return NextResponse.json({
        status: "pro",
        subscription_id: activeSub.id,
      });
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "free",
        stripe_subscription_id: null,
        cancel_at_period_end: false,
      })
      .eq("id", user.id);

    return NextResponse.json({ status: "free" });
  } catch (error: unknown) {
    console.error("Erro ao sincronizar assinatura:", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}