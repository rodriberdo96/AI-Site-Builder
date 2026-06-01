import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: { 
        enabled: true, 
    }, 
    trustedOrigins: env.trustedOrigins,
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    advanced:{
        cookies:{
            session_token: {
                name: 'auth_session',
                attributes:{
                    httpOnly: true,
                    secure: env.nodeEnv === 'production',
                    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
                    path: '/',
                }
            }
        }
    }
});