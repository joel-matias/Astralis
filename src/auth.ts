import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },

    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Contraseña', type: 'password' },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email as string },
                    include: { rol: true },
                })

                // Registramos el intento del usuario de acceder en el log
                if (!usuario) {
                    await prisma.logAuditoria.create({
                        data: {
                            accion: 'LOGIN',
                            modulo: 'auth',
                            resultado: 'Fallo',
                            detalles: `Email no registrado: ${credentials.email}`,
                        },
                    })
                    return null
                }

                // Para cuenta bloqueada tambien guardamos log
                if (usuario.estado === 'BLOQUEADO') {
                    await prisma.logAuditoria.create({
                        data: {
                            usuarioID: usuario.usuarioID,
                            accion: 'LOGIN',
                            modulo: 'auth',
                            resultado: 'Bloqueado',
                            detalles: 'Intento de acceso a cuenta bloqueada',
                        },
                    })
                    throw new Error('CUENTA_BLOQUEADA')
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
                        },
                    })

                    // Si alcanzo el maximo de intentos tambien se guarda el log
                    await prisma.logAuditoria.create({
                        data: {
                            usuarioID: usuario.usuarioID,
                            accion: 'LOGIN',
                            modulo: 'auth',
                            resultado: bloquear ? 'Bloqueado' : 'Fallo',
                            detalles: `Intento ${nuevoIntentos}/3 fallido`,
                        },
                    })

                    if (bloquear) throw new Error('CUENTA_BLOQUEADA')
                    return null
                }

                // Si el login es exitoso tambien gardamos el login
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
                    },
                })

                return {
                    id: usuario.usuarioID,
                    name: usuario.nombreCompleto,
                    email: usuario.email,
                    role: usuario.rol.nombre,
                }
            },
        }),
    ],

    callbacks: {
        // Pasa el rol al token JWT
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role
            return token
        },
        // Expone el rol en la sesión del cliente
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string
                    ; (session.user as any).role = token.role
            }
            return session
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },
})