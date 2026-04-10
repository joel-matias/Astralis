import NextAuth from 'next-auth'
import { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

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

            async authorize(credentials, request) {
                if (!credentials?.email || !credentials?.password) return null

                const ip =
                    request?.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
                    request?.headers.get('x-real-ip') ??
                    '0.0.0.0'

                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email as string },
                    include: { rol: true },
                })

                if (!usuario) {
                    await prisma.logAuditoria.create({
                        data: {
                            accion: 'LOGIN',
                            modulo: 'auth',
                            resultado: 'Fallo',
                            detalles: `Email no registrado: ${credentials.email}`,
                            ipOrigen: ip,
                        },
                    })
                    return null
                }

                const passwordOk = await bcrypt.compare(
                    credentials.password as string,
                    usuario.contrasenaHash
                )

                if (!passwordOk) {
                    const nuevoIntentos = usuario.intentosFallidos + 1
                    const bloquear = nuevoIntentos >= 3

                    await prisma.usuario.update({
                        where: { usuarioID: usuario.usuarioID },
                        data: {
                            intentosFallidos: nuevoIntentos,
                            estado: bloquear ? 'BLOQUEADO' : 'ACTIVO',
                            bloqueadoHasta: bloquear
                                ? new Date(Date.now() + 15 * 60 * 1000)
                                : null,
                        },
                    })

                    await prisma.logAuditoria.create({
                        data: {
                            usuarioID: usuario.usuarioID,
                            accion: 'LOGIN',
                            modulo: 'auth',
                            resultado: bloquear ? 'Bloqueado' : 'Fallo',
                            detalles: `Intento ${nuevoIntentos}/3 fallido`,
                            ipOrigen: ip,
                        },
                    })

                    if (bloquear) {
                        await prisma.logAuditoria.create({
                            data: {
                                usuarioID: usuario.usuarioID,
                                accion: 'BLOQUEO_CUENTA',
                                modulo: 'auth',
                                resultado: 'Bloqueado',
                                detalles: `Cuenta bloqueada automáticamente tras 3 intentos fallidos. Requiere atención del administrador.`,
                                ipOrigen: ip,
                            },
                        })
                        throw new CuentaBloqueadaError()
                    }

                    return null
                }

                if (usuario.estado === 'BLOQUEADO') {
                    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta < new Date()) {
                        await prisma.usuario.update({
                            where: { usuarioID: usuario.usuarioID },
                            data: { estado: 'ACTIVO', intentosFallidos: 0, bloqueadoHasta: null },
                        })
                    } else {
                        await prisma.logAuditoria.create({
                            data: {
                                usuarioID: usuario.usuarioID,
                                accion: 'LOGIN',
                                modulo: 'auth',
                                resultado: 'Bloqueado',
                                detalles: 'Intento de acceso a cuenta bloqueada',
                                ipOrigen: ip,
                            },
                        })
                        throw new CuentaBloqueadaError()
                    }
                }

                const sesionID = crypto.randomUUID()
                const fechaExpiracion = new Date(Date.now() + 8 * 60 * 60 * 1000)

                await prisma.sesionActiva.create({
                    data: {
                        sesionID,
                        usuarioID: usuario.usuarioID,
                        tokenAcceso: sesionID, // UUID como referencia; el JWT real viaja en cookie
                        fechaExpiracion,
                        ipOrigen: ip,
                        activa: true,
                    },
                })

                await prisma.usuario.update({
                    where: { usuarioID: usuario.usuarioID },
                    data: { intentosFallidos: 0 },
                })

                await prisma.logAuditoria.create({
                    data: {
                        usuarioID: usuario.usuarioID,
                        accion: 'LOGIN',
                        modulo: 'auth',
                        resultado: 'Exito',
                        detalles: 'Inicio de sesión exitoso',
                        ipOrigen: ip,
                    },
                })

                return {
                    id: usuario.usuarioID,
                    name: usuario.nombreCompleto,
                    email: usuario.email,
                    role: usuario.rol.nombre,
                    sesionID,
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

    events: {
        async signOut(message) {
            const token = 'token' in message ? message.token : null
            const sesionID = token?.sesionID as string | undefined
            if (sesionID) {
                await prisma.sesionActiva.updateMany({
                    where: { sesionID, activa: true },
                    data: { activa: false },
                }).catch(() => { /* sesión ya expirada */ })
            }
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },
})
