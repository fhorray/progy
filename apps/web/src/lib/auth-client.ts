import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { getCloudflareContext } from "@opennextjs/cloudflare"


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL! || "https://progy.francy.workers.dev/api/auth",
  plugins: [
    stripeClient({
      subscription: true
    })
  ]
})
