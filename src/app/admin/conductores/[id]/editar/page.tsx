import { notFound } from 'next/navigation'
import { RepoCond } from '@/repositories/conductores/RepoCond'
import UIAct from '../../_components/UIAct'

// D7 CU6 — UIAct: Página Actualizar Conductor

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditarConductorPage({ params }: PageProps) {
    const { id } = await params
    const repo = new RepoCond()
    const conductor = await repo.findByID(id)
    if (!conductor) notFound()

    return (
        <div className="pt-8 pb-12 px-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <a href={`/admin/conductores/${id}`}
                    className="text-secondary hover:text-primary flex items-center gap-1 text-sm mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    {conductor.nombreCompleto}
                </a>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                    Actualizar conductor
                </h1>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.06)]">
                <UIAct conductor={{
                    conductorID: conductor.conductorID,
                    nombreCompleto: conductor.nombreCompleto,
                    domicilio: conductor.domicilio,
                    numeroTelefonico: conductor.numeroTelefonico,
                    vigenciaLicencia: conductor.vigenciaLicencia,
                    curp: conductor.curp,
                    numeroLicencia: conductor.numeroLicencia,
                }} />
            </div>
        </div>
    )
}
