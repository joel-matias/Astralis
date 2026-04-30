import { NegAsig } from '@/services/conductores/NegAsig'
import { RepoCond } from '@/repositories/conductores/RepoCond'
import UIAsig from '../_components/UIAsig'

// D7, D6 CU6 — UIAsig: Página Asignación Conductor a Viaje
// Actor D7: Despachador de Unidades — no existe en el sistema; acceso por ADMIN/GERENTE (ver correcciones D7)

export default async function AsignarConductorPage() {
    const negAsig = new NegAsig()
    const repoCond = new RepoCond()

    const [viajes, conductores] = await Promise.all([
        negAsig.obtenerViajesProgramados(),
        repoCond.findAll(),
    ])

    const viajesSerialized = viajes.map(v => ({
        horarioID: v.horarioID,
        ruta: {
            nombreRuta: v.ruta.nombreRuta,
            ciudadOrigen: v.ruta.ciudadOrigen,
            ciudadDestino: v.ruta.ciudadDestino,
        },
        conductor: v.conductor ? { nombreCompleto: v.conductor.nombreCompleto } : null,
        fechaInicio: v.fechaInicio,
        horaSalida: v.horaSalida,
    }))

    const conductoresSerialized = conductores.map(c => ({
        conductorID: c.conductorID,
        nombreCompleto: c.nombreCompleto,
        curp: c.curp,
        vigenciaLicencia: c.vigenciaLicencia,
        estado: c.estado,
    }))

    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <a href="/admin/conductores"
                    className="text-secondary hover:text-primary flex items-center gap-1 text-sm mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Conductores
                </a>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                    Asignar conductor a viaje
                </h1>
                <p className="text-secondary text-sm mt-1">
                    Vincula un conductor disponible con un horario programado.
                </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.06)]">
                <UIAsig viajes={viajesSerialized} conductores={conductoresSerialized} />
            </div>
        </div>
    )
}
