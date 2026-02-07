import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { getCloudflareContext } from "@opennextjs/cloudflare"


export const authClient = createAuthClient({
  baseURL: getCloudflareContext().env.NEXT_PUBLIC_API_URL!,
  plugins: [
    stripeClient({
      subscription: true
    })
  ]
})
