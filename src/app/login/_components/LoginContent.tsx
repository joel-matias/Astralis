'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormularioCredenciales } from './FormularioCredenciales'
import { MensajeErrorAutenticacion } from './MensajeErrorAutenticacion'
import { IndicadorCuentaBloqueada } from './IndicadorCuentaBloqueada'

function rutaSegunRol(role: string | undefined): string {
    switch (role) {
        case 'ADMIN':              return '/admin/dashboard'
        case 'GERENTE':            return '/admin/horarios'
        case 'VENDEDOR_TAQUILLA':  return '/pos'
        case 'SUPERVISOR_ANDENES': return '/andenes'
        case 'ENCARGADO_EQUIPAJE': return '/equipaje'
        default:                   return '/'
    }
}

export function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [bloqueada, setBloqueada] = useState(searchParams.get('code') === 'cuenta_bloqueada')

    async function handleSubmit(email: string, password: string) {
        setError('')
        setLoading(true)

        const result = await signIn('credentials', { email, password, redirect: false })

        setLoading(false)

        if (result?.code === 'cuenta_bloqueada') {
            setBloqueada(true)
            return
        }

        if (result?.error) {
            setError('Correo o contraseña incorrectos.')
            return
        }

        const session = await getSession()
        const role = (session?.user as { role?: string } | null)?.role
        router.push(rutaSegunRol(role))
    }

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/30 shadow-sm">
                <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
                    <span className="text-2xl font-extrabold tracking-tighter text-primary font-headline">
                        Astralis
                    </span>
                    <span className="hidden md:block text-sm font-medium text-on-surface-variant">
                        Portal de Acceso
                    </span>
                </div>
            </nav>

            <main className="grow flex items-center justify-center px-4 py-12 relative overflow-hidden">

                <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                    <div className="absolute -top-[10%] -left-[5%] w-sm h-sm rounded-full bg-surface-container-high blur-3xl" />
                    <div className="absolute -bottom-[10%] -right-[5%] w-lg h-lg rounded-full bg-primary-fixed blur-3xl opacity-30" />
                </div>

                <div className="w-full max-w-md z-10">

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6 text-on-primary shadow-xl">
                            <span className="material-symbols-outlined text-[2rem]">
                                directions_bus
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">
                            Astralis
                        </h1>
                        <p className="text-secondary text-sm font-medium">
                            Ingresa tus credenciales para acceder al sistema.
                        </p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-[0_40px_100px_rgba(20,27,44,0.08)]">
                        {bloqueada && <IndicadorCuentaBloqueada />}
                        {error && <MensajeErrorAutenticacion mensaje={error} />}
                        <FormularioCredenciales onSubmit={handleSubmit} loading={loading} />

                        <div className="mt-8 pt-6 border-t border-surface-container-high flex justify-center">
                            <p className="text-xs text-secondary/60 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base select-none">
                                    verified_user
                                </span>
                                Acceso seguro con cifrado empresarial
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="w-full py-8 px-8 border-t border-outline-variant/20 bg-surface-container-low">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
                    <span className="font-headline font-bold text-on-surface text-sm">
                        Astralis — Sistema de Gestión de Transporte
                    </span>
                    <p className="text-xs tracking-wide uppercase text-on-surface-variant/50">
                        © 2024 Astralis. Todos los derechos reservados.
                    </p>
                </div>
            </footer>

        </div>
    )
}
