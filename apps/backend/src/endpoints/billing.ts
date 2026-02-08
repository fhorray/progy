
import { Hono } from "hono";
import { authServer } from "../auth";
import Stripe from "stripe";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { AuthVariables } from "../auth-utils";

const billing = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

billing.post("/checkout", async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const plan = c.req.query("plan") || "pro";

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover" as any,
    httpClient: Stripe.createFetchHttpClient()
  });

  // Ensure redirect goes back to the frontend dashboard
  const origin = c.req.header("origin") || "https://progy.dev";
  const redirectBase = origin.includes("localhost") ? origin : "https://progy.dev";

  let priceId = c.env.STRIPE_PRICE_ID_PRO;
  let mode: Stripe.Checkout.SessionCreateParams.Mode = "subscription";

  // DISCOUNT LOGIC: If buying Pro but already Lifetime, use Discount Price
  if (plan === "pro" && user.subscription === "lifetime") {
    priceId = "price_1SyFpZGdycZGJETWwc9zs2uV";
  }

  if (plan === "lifetime") {
    priceId = c.env.STRIPE_PRICE_ID_LIFETIME;
    mode = "payment";
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: mode,
    success_url: `${redirectBase}/dashboard?payment_success=true`,
    cancel_url: `${redirectBase}/dashboard`,
    metadata: {
      userId: user.id,
      planType: plan,
    },
  });

  return c.json({ url: checkoutSession.url });
});

export default billing;
