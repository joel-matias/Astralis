import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EstadoAnden } from '@prisma/client'

const ESTADO_BADGE: Record<EstadoAnden, { texto: string; clase: string }> = {
    DISPONIBLE:   { texto: 'Disponible',   clase: 'bg-primary-fixed text-primary' },
    RESERVADO:    { texto: 'Reservado',    clase: 'bg-secondary-container text-secondary' },
    OCUPADO:      { texto: 'Ocupado',      clase: 'bg-tertiary-container text-on-tertiary-container' },
    MANTENIMIENTO:{ texto: 'Mantenimiento', clase: 'bg-error-container text-error' },
}

interface Props {
    params: Promise<{ id: string }>
}

export default async function AndenDetallePage({ params }: Props) {
    const { id } = await params

    const anden = await prisma.anden.findUnique({
        where: { andenID: id },
        include: {
            asignaciones: {
                where: { cancelada: false },
                orderBy: { fechaHora: 'desc' },
                include: {
                    horario: {
                        select: {
                            horaSalida: true,
                            estado: true,
                            ruta: { select: { nombreRuta: true, ciudadOrigen: true, ciudadDestino: true } },
                            autobus: { select: { numeroEconomico: true, placas: true } },
                            conductor: { select: { nombreCompleto: true } },
                        },
                    },
                },
            },
        },
    })

    if (!anden) notFound()

    const badge = ESTADO_BADGE[anden.estado]
    const asignacionesActivas = anden.asignaciones.filter(
        a => a.estado === 'RESERVADO' || a.estado === 'OCUPADO'
    )

    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">

            <header className="mb-10">
                <nav className="flex items-center gap-2 text-secondary mb-3 text-sm font-medium">
                    <Link href="/admin/andenes" className="hover:text-primary transition-colors">Andenes</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-on-surface">Andén #{anden.numero}</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Andén #{anden.numero}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.clase}`}>
                            {badge.texto}
                        </span>
                    </div>
                    <Link
                        href={`/admin/andenes/${id}/editar`}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow hover:opacity-90 transition-all active:scale-95 w-fit"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Editar andén
                    </Link>
                </div>
            </header>

            {/* Info general */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)] mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-5">Información general</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-secondary mb-1">Número</p>
                        <p className="text-2xl font-extrabold text-on-surface">#{anden.numero}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary mb-1">Capacidad</p>
                        <p className="text-2xl font-extrabold text-on-surface">{anden.capacidad} <span className="text-sm font-normal text-secondary">buses</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary mb-1">Ocupación actual</p>
                        <p className="text-2xl font-extrabold text-on-surface">
                            {asignacionesActivas.length}
                            <span className="text-sm font-normal text-secondary"> / {anden.capacidad}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary mb-1">Horario operativo</p>
                        <p className="text-sm font-bold text-on-surface">{anden.horarioDisponible ?? '—'}</p>
                    </div>
                </div>
            </section>

            {/* Asignaciones activas */}
            <section className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 bg-surface-container-low">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Asignaciones activas</h2>
                    <Link
                        href="/admin/andenes/asignar"
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva asignación
                    </Link>
                </div>

                {asignacionesActivas.length === 0 ? (
                    <div className="px-6 py-16 text-center text-secondary">
                        <span className="material-symbols-outlined text-5xl block mb-2 text-outline">directions_bus</span>
                        <p className="font-semibold">Sin asignaciones activas</p>
                        <p className="text-sm mt-1">Este andén no tiene autobuses asignados en este momento.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-outline-variant">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Autobús</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Ruta</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Conductor</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Hora salida</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignacionesActivas.map((asig) => (
                                <tr key={asig.asignacionID} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-on-surface">{asig.horario.autobus.numeroEconomico}</p>
                                        <p className="text-xs text-secondary">{asig.horario.autobus.placas}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-on-surface">{asig.horario.ruta.nombreRuta}</p>
                                        <p className="text-xs text-secondary">{asig.horario.ruta.ciudadOrigen} → {asig.horario.ruta.ciudadDestino}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">
                                        {asig.horario.conductor.nombreCompleto}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">
                                        {new Date(asig.horario.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            asig.estado === 'OCUPADO'
                                                ? 'bg-tertiary-container text-on-tertiary-container'
                                                : 'bg-secondary-container text-secondary'
                                        }`}>
                                            {asig.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
