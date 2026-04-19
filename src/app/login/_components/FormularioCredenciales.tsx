'use client'

interface Props {
    onSubmit: (email: string, password: string) => void
    loading: boolean
}

// stc::autenticacion — formulario reutilizable de ingreso de credenciales
export function FormularioCredenciales({ onSubmit, loading }: Props) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value
        onSubmit(email, password)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant">
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
                <label htmlFor="password" className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant">
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

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold rounded-full text-sm tracking-wide shadow-lg shadow-primary/20 hover:-translate-y-px active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
        </form>
    )
}
