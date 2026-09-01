import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_CONFIG } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura do Stripe não informada no cabeçalho." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const webhookSecret = STRIPE_CONFIG.webhookSecret;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET não está configurado.");
    return NextResponse.json(
      { error: "Configuração do Webhook ausente no servidor." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error(`⚠️ Falha na verificação de assinatura do Webhook: ${errorMsg}`);
    return NextResponse.json(
      { error: `Webhook Signature Error: ${errorMsg}` },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const userId =
            session.metadata?.supabase_user_id ||
            subscription.metadata?.supabase_user_id;

          const customerId = session.customer as string;
          const priceId = subscription.items.data[0]?.price.id;
          const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
            ? new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
            : null;

          if (userId) {
            await supabaseAdmin
              .from("profiles")
              .update({
                subscription_status: "pro",
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: subscription.cancel_at_period_end,
              })
              .eq("id", userId);
          } else if (customerId) {
            await supabaseAdmin
              .from("profiles")
              .update({
                subscription_status: "pro",
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: subscription.cancel_at_period_end,
              })
              .eq("stripe_customer_id", customerId);
          }

          console.log(`✅ Assinatura Pro ativada com sucesso para ${userId || customerId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.supabase_user_id;

        const isPro = ["active", "trialing"].includes(subscription.status);
        const priceId = subscription.items.data[0]?.price.id;
        const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
          ? new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
          : null;

        const updatePayload = {
          subscription_status: isPro ? "pro" : "free",
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        };

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .eq("id", userId);
        } else {
          await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .eq("stripe_customer_id", customerId);
        }

        console.log(`ℹ️ Assinatura atualizada (Status: ${subscription.status}) para cliente ${customerId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.supabase_user_id;

        const updatePayload = {
          subscription_status: "free",
          stripe_subscription_id: null,
          cancel_at_period_end: false,
        };

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .eq("id", userId);
        } else {
          await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .eq("stripe_customer_id", customerId);
        }

        console.log(`❌ Assinatura cancelada/expirada para o cliente ${customerId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
            ? new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
            : null;

          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "pro",
              current_period_end: currentPeriodEnd,
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.warn(`⚠️ Pagamento de fatura falhou para o cliente ${customerId}`);
        break;
      }

      default:
        // Outros eventos recebidos são confirmados sem erro
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Erro ao processar evento do Webhook Stripe:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
