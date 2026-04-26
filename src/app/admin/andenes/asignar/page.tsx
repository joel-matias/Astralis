import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AsignarForm } from '../_components/AsignarForm'
import { asignarAnden } from '../actions'

export default async function AsignarAndenPage() {

    // Horarios programados sin andén asignado (flujo normal paso 2)
    const horarios = await prisma.horario.findMany({
        where: {
            estado: 'ACTIVO',
            asignacionesAnden: {
                none: {
                    cancelada: false,
                    estado: { in: ['RESERVADO', 'OCUPADO'] }
                }
            }
        },
        include: {
            ruta: {
                select: { nombreRuta: true, ciudadOrigen: true, ciudadDestino: true }
            },
            autobus: {
                select: { numeroEconomico: true, placas: true }
            }
        },
        orderBy: { horaSalida: 'asc' }
    })

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
                horarios={horarios}
                andenes={andenes}
                action={asignarAnden}
            />
        </div>
    )
}