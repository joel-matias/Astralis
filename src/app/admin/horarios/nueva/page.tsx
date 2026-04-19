import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NuevoHorarioForm } from '../_components/NuevoHorarioForm'

export default async function NuevoHorarioPage() {
    const [rutas, autobuses, conductores] = await Promise.all([
        prisma.ruta.findMany({
            where: { estado: 'ACTIVA' },
            select: { rutaID: true, codigoRuta: true, ciudadOrigen: true, ciudadDestino: true, tarifaBase: true },
            orderBy: { codigoRuta: 'asc' },
        }),
        prisma.autobus.findMany({
            where: { estadoOperativo: 'DISPONIBLE' },
            select: { autobusID: true, numeroEconomico: true, tipoServicio: true, capacidadAsientos: true },
            orderBy: { numeroEconomico: 'asc' },
        }),
        prisma.conductor.findMany({
            where: { estado: 'ACTIVO', disponible: true },
            select: { conductorID: true, nombreCompleto: true, vigenciaLicencia: true },
            orderBy: { nombreCompleto: 'asc' },
        }),
    ])

    const rutasSerializable = rutas.map(r => ({ ...r, tarifaBase: Number(r.tarifaBase) }))

    return (
        <div className="pt-8 pb-12 px-8 max-w-4xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-2 text-secondary text-sm mb-3">
                    <Link href="/admin/horarios" className="hover:text-primary transition-colors">
                        Horarios
                    </Link>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span>Nuevo horario</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                    Programar Horario de Viaje
                </h1>
                <p className="text-secondary text-sm mt-1">
                    Asigna ruta, autobús y conductor para el nuevo servicio.
                </p>
            </header>

            <NuevoHorarioForm
                rutas={rutasSerializable}
                autobuses={autobuses}
                conductores={conductores}
            />
        </div>
    )
}
