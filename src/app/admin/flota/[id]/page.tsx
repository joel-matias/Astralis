import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RepositorioAutobus } from '@/repositories/flota/RepositorioAutobus'
import { RepositorioMantenimiento } from '@/repositories/flota/RepositorioMantenimiento'
import { prisma } from '@/lib/prisma'
import { UIEstado } from '../_components/UIEstado'
import { UIMtto } from '../_components/UIMtto'
import { UIAsig } from '../_components/UIAsig'
import { UIAct } from '../_components/UIAct'
import { EstadoAutobus, TipoServicio, TipoMantenimiento } from '@prisma/client'

const ESTADO_BADGE: Record<EstadoAutobus, { texto: string; clase: string; icono: string }> = {
    DISPONIBLE:       { texto: 'Disponible',       clase: 'bg-primary-fixed text-primary',         icono: 'check_circle' },
    ASIGNADO:         { texto: 'Asignado',          clase: 'bg-secondary-container text-secondary',  icono: 'directions_bus' },
    EN_MANTENIMIENTO: { texto: 'En Mantenimiento',  clase: 'bg-tertiary-container text-tertiary',   icono: 'build' },
    FUERA_DE_SERVICIO:{ texto: 'Fuera de Servicio', clase: 'bg-error-container text-error',         icono: 'block' },
}
const TIPO_LABEL: Record<TipoServicio, string> = { ECONOMICO: 'Económico', EJECUTIVO: 'Ejecutivo', LUJO: 'Primera' }
const MTO_LABEL: Record<TipoMantenimiento, string> = { PREVENTIVO: 'Preventivo', CORRECTIVO: 'Correctivo' }

// D8: UIAct / UIEstado / UIMtto / UIAsig — detalle con todos los paneles de gestión
export default async function DetalleAutobusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const repo = new RepositorioAutobus()
    const repoMto = new RepositorioMantenimiento()

    const bus = await repo.findByID(id)
    if (!bus) notFound()

    const mantenimientos = await repoMto.findByAutobus(id)
    const mtoAbierto = mantenimientos.find(m => m.estaAbierto) ?? null

    const [conductoresDisponibles, horariosDisponibles] = await Promise.all([
        prisma.conductor.findMany({
            where: { estado: 'ACTIVO', disponible: true },
            select: { conductorID: true, nombreCompleto: true },
            orderBy: { nombreCompleto: 'asc' },
        }),
        prisma.horario.findMany({
            where: { estado: 'ACTIVO', asignacionAutobusViaje: null },
            include: { ruta: true },
            orderBy: { fechaInicio: 'asc' },
            take: 20,
        }),
    ])

    const asignacionActiva = bus.asignaciones[0] ?? null
    const badge = ESTADO_BADGE[bus.estadoOperativo]

    return (
        <div className="pt-8 pb-12 px-8 max-w-6xl mx-auto">

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/flota"
                        className="p-2 bg-surface-container-low text-primary rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                                {bus.numeroEconomico}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${badge.clase}`}>
                                <span className="material-symbols-outlined text-[14px]">{badge.icono}</span>
                                {badge.texto}
                            </span>
                        </div>
                        <p className="text-secondary font-medium">
                            {bus.marca} {bus.modelo} · {bus.anio} · {TIPO_LABEL[bus.tipoServicio]}
                        </p>
                    </div>
                </div>
            </header>

            {/* Datos del vehículo */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)] mb-6">
                <div className="flex items-start justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary opacity-70">Datos del vehículo</span>
                    <span className="material-symbols-outlined text-primary-container">directions_bus</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                        <p className="text-secondary font-medium mb-0.5">Placas</p>
                        <p className="font-bold text-on-surface">{bus.placas}</p>
                    </div>
                    <div>
                        <p className="text-secondary font-medium mb-0.5">VIN</p>
                        <p className="font-mono text-xs text-on-surface">{bus.vin}</p>
                    </div>
                    <div>
                        <p className="text-secondary font-medium mb-0.5">Capacidad</p>
                        <p className="font-bold text-on-surface">{bus.capacidadAsientos} asientos</p>
                        <p className="text-xs text-secondary">{bus._count.asientos} generados</p>
                    </div>
                    <div>
                        <p className="text-secondary font-medium mb-0.5">Registro</p>
                        <p className="font-bold text-on-surface">{bus.fechaRegistro.toLocaleDateString('es-MX')}</p>
                        {bus.ultimoMantenimiento && (
                            <p className="text-xs text-secondary">Último mto: {new Date(bus.ultimoMantenimiento).toLocaleDateString('es-MX')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Asignación activa */}
            {asignacionActiva && (
                <div className="bg-secondary-container rounded-xl p-5 mb-6 flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">directions_bus</span>
                    <div className="flex-1 text-sm">
                        <p className="font-semibold text-on-surface mb-1">Asignación activa</p>
                        <p className="text-secondary">
                            Ruta: <strong className="text-on-surface">
                                {asignacionActiva.horario.ruta.ciudadOrigen} → {asignacionActiva.horario.ruta.ciudadDestino}
                            </strong>
                        </p>
                        <p className="text-secondary">Conductor: {asignacionActiva.conductor.nombreCompleto}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* UIAct — Actualizar datos */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary-container">edit</span>
                        <h2 className="font-bold text-on-surface">Actualizar datos</h2>
                    </div>
                    <UIAct autobus={{
                        autobusID: bus.autobusID,
                        marca: bus.marca,
                        modelo: bus.modelo,
                        capacidadAsientos: bus.capacidadAsientos,
                        tipoServicio: bus.tipoServicio,
                    }} />
                </div>

                {/* UIEstado — Cambiar estado */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary-container">swap_horiz</span>
                        <h2 className="font-bold text-on-surface">Cambiar estado</h2>
                    </div>
                    <UIEstado
                        autobusID={bus.autobusID}
                        estadoActual={bus.estadoOperativo}
                        numeroEconomico={bus.numeroEconomico}
                    />
                </div>

                {/* UIMtto — Mantenimiento */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary-container">build</span>
                        <h2 className="font-bold text-on-surface">Mantenimiento</h2>
                    </div>
                    <UIMtto
                        autobusID={bus.autobusID}
                        numeroEconomico={bus.numeroEconomico}
                        mantenimientoAbierto={mtoAbierto ? {
                            mantenimientoID: mtoAbierto.mantenimientoID,
                            tipo: mtoAbierto.tipo,
                            fechaInicio: mtoAbierto.fechaInicio,
                            descripcionActividad: mtoAbierto.descripcionActividad,
                            responsable: mtoAbierto.responsable,
                        } : null}
                    />
                </div>

                {/* UIAsig — Asignación (solo si está disponible) */}
                {bus.estadoOperativo === EstadoAutobus.DISPONIBLE && (
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined text-primary-container">link</span>
                            <h2 className="font-bold text-on-surface">Asignar a horario</h2>
                        </div>
                        <UIAsig
                            autobusID={bus.autobusID}
                            numeroEconomico={bus.numeroEconomico}
                            conductores={conductoresDisponibles}
                            horarios={horariosDisponibles.map(h => ({
                                horarioID: h.horarioID,
                                etiqueta: `${h.ruta.ciudadOrigen} → ${h.ruta.ciudadDestino} · ${new Date(h.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} (${h.frecuencia})`,
                            }))}
                        />
                    </div>
                )}
            </div>

            {/* Historial de mantenimientos */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-container-low flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">history</span>
                    <h2 className="font-bold text-on-surface">Historial de mantenimientos</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Inicio</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Cierre</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Responsable</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mantenimientos.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-secondary">
                                    <span className="material-symbols-outlined text-4xl block mb-2 text-outline">build</span>
                                    Sin historial de mantenimiento
                                </td>
                            </tr>
                        )}
                        {mantenimientos.map((m, i) => (
                            <tr key={m.mantenimientoID}
                                className={`hover:bg-surface-container-low/50 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                                <td className="px-6 py-4 text-sm font-medium text-on-surface">{MTO_LABEL[m.tipo]}</td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">
                                    {m.fechaInicio.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface-variant">
                                    {m.fechaFin ? new Date(m.fechaFin).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—'}
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface">{m.responsable}</td>
                                <td className="px-6 py-4">
                                    {m.estaAbierto
                                        ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-tertiary-container text-tertiary">Abierto</span>
                                        : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-secondary">Cerrado</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
