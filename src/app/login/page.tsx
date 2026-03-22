'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const bloqueoDesdeUrl = searchParams.get('code') === 'cuenta_bloqueada'

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        // Evitamos recargar la pagina y mejor manejamos el error desd el cleinte
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
            // Aqui mostramos un error simple, por ahora luego los cambiamos
            setError('Correo o contraseña incorrectos.')
            return
        }

        router.push('/')
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <h1>ASTRALIS — Iniciar sesión</h1>

                <input name="email" type="email" placeholder="Correo electrónico" required />
                <input name="password" type="password" placeholder="Contraseña" required />

                {(error || bloqueoDesdeUrl) && (
                    <p role="alert">
                        {error || 'Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.'}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </main>
    )
}
