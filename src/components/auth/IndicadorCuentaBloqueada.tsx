'use client'

// stc::autenticacion — alerta visual cuando la cuenta está bloqueada temporalmente
export function IndicadorCuentaBloqueada() {
    return (
        <div
            role="alert"
            data-testid="cuenta-bloqueada"
            className="flex items-start gap-2 px-4 py-3 bg-error-container rounded-xl text-on-error-container text-sm"
        >
            <span className="material-symbols-outlined text-lg shrink-0 mt-px select-none">
                lock
            </span>
            <span>
                Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.
            </span>
        </div>
    )
}
