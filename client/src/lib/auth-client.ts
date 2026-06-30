import { createAuthClient } from "better-auth/react"

const API_BASE_URL = (import.meta.env.VITE_BASEURL as string | undefined)?.trim().replace(/^['"]|['"]$/g, '') || 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL: API_BASE_URL,
    fetchOptions: {credentials: 'include'},
})

export const { signIn, signUp, useSession } = authClient