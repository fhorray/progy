import { createMutatorStore } from './query-client';
import { config } from '@/lib/config';

interface CheckoutParams {
  plan: 'lifetime' | 'pro';
  token: string;
}

interface CheckoutResponse {
  url: string;
}

export const $checkoutMutation = createMutatorStore<CheckoutParams, CheckoutResponse>(
  async ({ data }) => {
    const { plan, token } = data;
    const res = await fetch(`${config.API_URL}/api/billing/checkout/${plan}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      throw new Error('Failed to start checkout');
    }

    return res.json();
  }
);
