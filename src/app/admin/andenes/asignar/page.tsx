import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AsignarForm } from '../_components/AsignarForm'
import { asignarAnden } from '../actions'

export default async function AsignarAndenPage() {

    // Horarios programados sin andén asignado (flujo normal paso 2)
    const horarios = await prisma.horario.findMany({
    where: { estado: 'ACTIVO' },
    include: {
        ruta: {
            select: { nombreRuta: true, ciudadOrigen: true, ciudadDestino: true }
        },
        autobus: {
            select: { numeroEconomico: true, placas: true }
        },
        asignacionesAnden: {
            where: {
                cancelada: false,
                estado: { in: ['RESERVADO', 'OCUPADO'] }
            },
            take: 1,
            include: {
                anden: {
                    select: { andenID: true, numero: true, horarioDisponible: true }
                }
            }
        }
    },
    orderBy: { horaSalida: 'asc' }
})

    //horarios mapeados
    const horariosMapeados = horarios.map(h => ({
    horarioID: h.horarioID,
    horaSalida: h.horaSalida,
    ruta: h.ruta,
    autobus: h.autobus,
    andenAsignado: h.asignacionesAnden[0]
        ? {
            asignacionID: h.asignacionesAnden[0].asignacionID,
            anden: h.asignacionesAnden[0].anden
        }
        : null
}))

    // Andenes disponibles (flujo normal paso 4)
    const andenes = await prisma.anden.findMany({
        where: { estado: 'DISPONIBLE' },
        orderBy: { numero: 'asc' }
    })

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Link href="/admin/andenes" className="hover:text-primary transition-colors">
                            Gestión de Andenes
                        </Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span>Asignar Andén</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Asignar Andén a Autobús
                    </h1>
                    <p className="text-secondary mt-2 text-sm">
                        Selecciona el autobús programado y el andén disponible
                    </p>
                </div>
            </header>

            <AsignarForm
                horarios={horariosMapeados}
                andenes={andenes}
                action={asignarAnden}

            />
        </div>
    )
}