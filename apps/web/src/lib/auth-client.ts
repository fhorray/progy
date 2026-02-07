import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { AuthServer } from "../../../backend/src/auth"


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL! || "https://progy.francy.workers.dev",
  plugins: [
    inferAdditionalFields<AuthServer>(),
    stripeClient({
      subscription: true
    })
  ]
})
