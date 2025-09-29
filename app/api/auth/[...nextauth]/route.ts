import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        pin: { label: "PIN", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.pin) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: {
            pin: credentials.pin
          }
        })

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          rol: user.rol,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.rol = token.rol as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }