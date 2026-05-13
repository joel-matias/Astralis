'use client'

interface Props {
    error: Error & { digest?: string }
    reset: () => void
}

export default function HorariosError({ error, reset }: Props) {
    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
            <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-[0_0_40px_rgba(20,27,44,0.06)] flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
                <h2 className="text-xl font-bold text-on-surface mb-2">Ocurrió un error</h2>
                <p className="text-sm text-secondary mb-6 max-w-sm">
                    {error.message || 'No se pudo cargar la información. Intenta de nuevo.'}
                </p>
                <div className="flex gap-3">
                    <button onClick={reset}
                        className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">refresh</span>
                        Reintentar
                    </button>
                    <a href="/admin/horarios"
                        className="px-6 py-2.5 rounded-xl text-sm text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                        Volver a horarios
                    </a>
                </div>
            </div>
        </div>
    )
}
