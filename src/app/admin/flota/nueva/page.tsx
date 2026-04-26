import Link from 'next/link'
import { UIReg } from '../_components/UIReg'

// D8: UIReg — Página de registro de nuevo autobús (D3/D7 flujo completo)
export default function NuevoAutobusPage() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-3xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-secondary text-sm mb-3">
                    <Link href="/admin/flota" className="hover:text-primary transition-colors">
                        Flota
                    </Link>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span>Registrar autobús</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                    Registrar Autobús
                </h1>
                <p className="text-secondary text-sm mt-1">
                    Alta de nuevo vehículo en la flota — estado inicial: Disponible.
                </p>
            </header>

            <UIReg />
        </div>
    )
}
