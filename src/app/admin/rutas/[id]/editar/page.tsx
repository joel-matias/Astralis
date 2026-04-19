import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { RutaForm } from '../../_components/RutaForm'
import { actualizarRuta } from '../../actions'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditarRutaPage({ params }: PageProps) {
    const { id } = await params

    const ruta = await prisma.ruta.findUnique({
        where: { rutaID: id },
        include: { paradas: { orderBy: { ordenEnRuta: 'asc' } } },
    })

    if (!ruta) notFound()

    const actionBound = actualizarRuta.bind(null, ruta.rutaID)

    return (
        <div className="pt-8 pb-12 px-6 max-w-5xl mx-auto">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-secondary mb-2 text-sm font-medium">
                        <Link href="/admin/rutas" className="hover:text-primary transition-colors">Rutas</Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-on-surface">Editar {ruta.codigoRuta}</span>
                    </nav>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Editar Ruta
                    </h1>
                    <p className="text-secondary mt-1 text-sm">
                        {ruta.ciudadOrigen} → {ruta.ciudadDestino}
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

            <RutaForm
                modo="editar"
                action={actionBound}
                defaultValues={{
                    codigoRuta: ruta.codigoRuta,
                    tipoRuta: ruta.tipoRuta,
                    tarifaBase: Number(ruta.tarifaBase),
                    ciudadOrigen: ruta.ciudadOrigen,
                    terminalOrigen: ruta.terminalOrigen,
                    ciudadDestino: ruta.ciudadDestino,
                    terminalDestino: ruta.terminalDestino,
                    distanciaKm: Number(ruta.distanciaKm),
                    tiempoEstimadoHrs: Number(ruta.tiempoEstimadoHrs),
                }}
                defaultParadas={ruta.paradas.map((p, i) => ({
                    nombreParada: p.nombreParada,
                    ciudad: p.ciudad,
                    ordenEnRuta: p.ordenEnRuta ?? i + 1,
                    distanciaDesdeOrigenKm: Number(p.distanciaDesdeOrigenKm),
                    tiempoDesdeOrigen: 0,
                    tiempoEsperaMin: p.tiempoEsperaMin,
                    tarifaDesdeOrigen: Number(p.tarifaDesdeOrigen),
                }))}
            />
        </div>
    )
}
