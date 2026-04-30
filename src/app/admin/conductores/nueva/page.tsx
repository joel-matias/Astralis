// D7 CU6 — UIReg: Página Registrar Conductor
import UIReg from '../_components/UIReg'

export default function NuevaConductorPage() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <a href="/admin/conductores"
                    className="text-secondary hover:text-primary flex items-center gap-1 text-sm mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Conductores
                </a>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                    Registrar conductor
                </h1>
                <p className="text-secondary text-sm mt-1">Completa los datos del nuevo conductor.</p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.06)]">
                <UIReg />
            </div>
        </div>
    )
}
