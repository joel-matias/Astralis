'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function rutaSegunRol(role: string | undefined): string {
    switch (role) {
        case 'ADMIN':              return '/admin/dashboard'
        case 'GERENTE':            return '/operaciones/dashboard'
        case 'VENDEDOR_TAQUILLA':  return '/pos'
        case 'SUPERVISOR_ANDENES': return '/andenes'
        case 'ENCARGADO_EQUIPAJE': return '/equipaje'
        default:                   return '/'
    }
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const bloqueoDesdeUrl = searchParams.get('code') === 'cuenta_bloqueada'

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const form = e.currentTarget
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        setLoading(false)

        if (result?.code === 'cuenta_bloqueada') {
            setError('Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.')
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
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
                                >
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="correo@astralis.mx"
                                        required
                                        className="w-full px-5 py-4 pr-12 bg-surface-container-high rounded-full border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all text-on-surface placeholder:text-outline/50 text-sm"
                                    />
                                    <span className="material-symbols-outlined text-xl absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 select-none">
                                        mail
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant"
                                >
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-5 py-4 pr-12 bg-surface-container-high rounded-full border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all text-on-surface placeholder:text-outline/50 text-sm"
                                    />
                                    <span className="material-symbols-outlined text-xl absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 select-none">
                                        lock
                                    </span>
                                </div>
                            </div>

                            {(error || bloqueoDesdeUrl) && (
                                <div
                                    role="alert"
                                    data-testid="login-error"
                                    className="flex items-start gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-sm"
                                >
                                    <span className="material-symbols-outlined text-lg shrink-0 mt-px select-none">
                                        error
                                    </span>
                                    <span>
                                        {error || 'Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.'}
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold rounded-full text-sm tracking-wide shadow-lg shadow-primary/20 hover:-translate-y-px active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </button>
                        </form>

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
