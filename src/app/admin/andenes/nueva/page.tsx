import Link from 'next/link'
import { AndenForm } from '../_components/AndenForm'
import { crearAnden } from '../actions'

export default function NuevaAndenPage() {
    return (
        <div className="pt-8 pb-12 px-6 max-w-5xl mx-auto">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-secondary mb-2 text-sm font-medium">
                        <Link href="/admin/andenes" className="hover:text-primary transition-colors">Andenes</Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-on-surface">Nuevo Andén</span>
                    </nav>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Nuevo Andén
                    </h1>
                    <p className="text-secondary mt-1 text-sm">
                        Registra un nuevo andén en el sistema de estacionamiento.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/andenes"
                        className="px-6 py-2.5 rounded-full border border-outline-variant font-semibold text-secondary hover:bg-surface-container-low transition-colors duration-200 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </header>

            <AndenForm modo="crear" action={crearAnden} />
        </div>
    )
}