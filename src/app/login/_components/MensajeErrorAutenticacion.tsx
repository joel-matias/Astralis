'use client'

interface Props {
    mensaje: string
}

// stc::autenticacion — muestra errores de autenticación (credenciales inválidas, etc.)
export function MensajeErrorAutenticacion({ mensaje }: Props) {
    if (!mensaje) return null

    return (
        <div
            role="alert"
            data-testid="login-error"
            className="flex items-start gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-sm"
        >
            <span className="material-symbols-outlined text-lg shrink-0 mt-px select-none">
                error
            </span>
            <span>{mensaje}</span>
        </div>
    )
}
