import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function POST(_req: NextRequest) {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "stripe_subscription_id, subscription_status, trial_ends_at"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado para este usuário." },
        { status: 404 }
      );
    }

    const hasStripeSubscription = Boolean(profile.stripe_subscription_id);

    // 1. Caso tenha assinatura no Stripe: agendar cancelamento para o fim do período
    if (hasStripeSubscription) {
      const stripe = getStripe();
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({
        status: "cancelled",
        message:
          "Assinatura cancelada. O acesso Pro será mantido até o fim do período pago.",
      });
    }

    // 2. Sem assinatura no Stripe (trial ativo): encerrar o trial imediatamente
    await supabase
      .from("profiles")
      .update({ trial_ends_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({
      status: "cancelled",
      message: "Plano cancelado com sucesso.",
    });
  } catch (error: unknown) {
    console.error("Erro ao cancelar assinatura:", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}