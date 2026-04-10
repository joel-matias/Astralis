import Link from 'next/link'
import { RutaForm } from '../_components/RutaForm'
import { crearRuta } from '../actions'

export default function NuevaRutaPage() {
    return (
        <div className="pt-8 pb-12 px-6 max-w-5xl mx-auto">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-secondary mb-2 text-sm font-medium">
                        <Link href="/admin/rutas" className="hover:text-primary transition-colors">Rutas</Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-on-surface">Nueva Ruta</span>
                    </nav>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Nueva Ruta
                    </h1>
                    <p className="text-secondary mt-1 text-sm">
                        Define los parámetros operativos y financieros para la nueva conexión logística.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/rutas"
                        className="px-6 py-2.5 rounded-full border border-outline-variant font-semibold text-secondary hover:bg-surface-container-low transition-colors duration-200 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </header>

            <RutaForm modo="crear" action={crearRuta} />
        </div>
    )
}
