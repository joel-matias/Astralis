'use client'

import { signIn } from 'next-auth/react'

// stc::sesion — notifica al usuario que su sesión expiró (RN3: 8h de inactividad)
export function NotificacionSesionExpirada() {
    return (
        <div
            role="alert"
            data-testid="sesion-expirada"
            className="flex items-start gap-2 px-4 py-3 bg-secondary-container rounded-xl text-on-secondary-container text-sm"
        >
            <span className="material-symbols-outlined text-lg shrink-0 mt-px select-none">
                timer_off
            </span>
            <span>
                Tu sesión ha expirado.{' '}
                <button
                    onClick={() => signIn()}
                    className="underline font-semibold hover:opacity-75 transition-opacity"
                >
                    Volver a iniciar sesión
                </button>
            </span>
        </div>
    )
}
