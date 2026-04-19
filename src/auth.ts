import NextAuth from 'next-auth'
import { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { ControladorAutenticacion } from '@/services/seguridad/ControladorAutenticacion'

// E4: error personalizado que NextAuth expone al cliente como code='cuenta_bloqueada'
class CuentaBloqueadaError extends CredentialsSignin {
    code = 'cuenta_bloqueada'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },

    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Contraseña', type: 'password' },
            },

            // Paso 2 del diagrama: autenticar(usuario, contraseña)
            // PantallaLogin → ControladorAutenticacion
            async authorize(credentials, request) {
                if (!credentials?.email || !credentials?.password) return null

                const ip =
                    request?.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
                    request?.headers.get('x-real-ip') ??
                    '0.0.0.0'

                const controlador = new ControladorAutenticacion()
                const resultado = await controlador.autenticar(
                    credentials.email as string,
                    credentials.password as string,
                    ip
                )

                // Paso 10: retornarResultado(token, rol) → PantallaLogin
                if (!resultado.exito) {
                    if (resultado.motivo === 'cuenta_bloqueada') throw new CuentaBloqueadaError()
                    return null
                }

                // Paso 11: [autenticacionExitosa] → NextAuth construye el JWT y redirige al Dashboard
                return {
                    id: resultado.usuarioID,
                    name: resultado.nombreCompleto,
                    email: resultado.email,
                    role: resultado.rol,
                    sesionID: resultado.sesionID,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role: string }).role
                token.sesionID = (user as { sesionID: string }).sesionID
            }
            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string
                    ; (session.user as unknown as Record<string, unknown>).role = token.role
                    ; (session.user as unknown as Record<string, unknown>).sesionID = token.sesionID
            }
            return session
        },
    },

    // Paso 12: cerrarSesion → invalida la SesionActiva en BD
    events: {
        async signOut(message) {
            const token = 'token' in message ? message.token : null
            const sesionID = token?.sesionID as string | undefined
            if (sesionID) {
                await prisma.sesionActiva.updateMany({
                    where: { sesionID, activa: true },
                    data: { activa: false },
                }).catch(() => { /* sesión ya expirada o inexistente */ })
            }
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },
})
