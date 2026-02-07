import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { config } from "./config"

export const authClient = createAuthClient({
  baseURL: config.API_URL,
  plugins: [
    stripeClient({
      subscription: true
    })
  ]
})
