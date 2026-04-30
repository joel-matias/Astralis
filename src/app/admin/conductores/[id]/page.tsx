import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RepoCond } from '@/repositories/conductores/RepoCond'
import { RepoAsig } from '@/repositories/conductores/RepoAsig'
import { EstadoConductor } from '@prisma/client'
import UIEstado from '../_components/UIEstado'
import UIBaja from '../_components/UIBaja'
import { liberarConductorAction } from '../actions'

// D7 CU6 — Detalle del conductor: muestra estado, asignaciones y controles de estado/baja

const ESTADO_BADGE: Record<EstadoConductor, { texto: string; clase: string; icono: string }> = {
    ACTIVO:        { texto: 'Activo',        clase: 'bg-primary-fixed text-primary',        icono: 'check_circle' },
    NO_DISPONIBLE: { texto: 'No Disponible', clase: 'bg-secondary-container text-secondary', icono: 'pause_circle' },
    INACTIVO:      { texto: 'Inactivo',      clase: 'bg-error-container text-error',         icono: 'person_off' },
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ConductorDetallePage({ params }: PageProps) {
    const { id } = await params
    const repo = new RepoCond()
    const repoAsig = new RepoAsig()

    const conductor = await repo.findByID(id)
    if (!conductor) notFound()

    const asignacionActiva = await repoAsig.findActivaByConductor(id)
    const tieneViajeActivo = asignacionActiva !== null

    const badge = ESTADO_BADGE[conductor.estado]
    const licenciaVigente = new Date(conductor.vigenciaLicencia) > new Date()

    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
            <div className="mb-6">
                <a href="/admin/conductores"
                    className="text-secondary hover:text-primary flex items-center gap-1 text-sm mb-4 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Conductores
                </a>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                            {conductor.nombreCompleto}
                        </h1>
                        <p className="text-secondary text-sm mt-1 font-mono">{conductor.curp}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${badge.clase}`}>
                            <span className="material-symbols-outlined text-sm">{badge.icono}</span>
                            {badge.texto}
                        </span>
                        <Link href={`/admin/conductores/${id}/editar`}
                            className="px-4 py-2 rounded-xl text-sm border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Editar
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Datos personales */}
                <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-base font-semibold text-on-surface mb-4">Datos del conductor</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-secondary">Licencia</dt>
                            <dd className="font-mono text-on-surface">{conductor.numeroLicencia}</dd>
                        </div>
                        <div>
                            <dt className="text-secondary">Vigencia licencia</dt>
                            <dd className={licenciaVigente ? 'text-primary font-medium' : 'text-error font-medium'}>
                                {new Date(conductor.vigenciaLicencia).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                {!licenciaVigente && ' (Vencida)'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-secondary">Teléfono</dt>
                            <dd className="text-on-surface">{conductor.numeroTelefonico ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-secondary">Domicilio</dt>
                            <dd className="text-on-surface">{conductor.domicilio ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-secondary">Fecha registro</dt>
                            <dd className="text-on-surface">{new Date(conductor.fechaRegistro).toLocaleDateString('es-MX')}</dd>
                        </div>
                        <div>
                            <dt className="text-secondary">Horas acumuladas</dt>
                            <dd className="text-on-surface">{Number(conductor.horasAcumuladas)} hrs</dd>
                        </div>
                        {conductor.motivoBaja && (
                            <div className="col-span-2">
                                <dt className="text-secondary">Motivo</dt>
                                <dd className="text-on-surface">{conductor.motivoBaja}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Asignación activa */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-base font-semibold text-on-surface mb-4">Asignación activa</h2>
                    {asignacionActiva ? (
                        <div className="space-y-3 text-sm">
                            <p className="font-semibold text-on-surface">
                                {asignacionActiva.horario.ruta.ciudadOrigen} → {asignacionActiva.horario.ruta.ciudadDestino}
                            </p>
                            <p className="text-secondary">
                                {new Date(asignacionActiva.horario.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                            </p>
                            <form action={async () => {
                                'use server'
                                await liberarConductorAction(asignacionActiva.asignacionID, conductor.conductorID)
                            }}>
                                <button type="submit"
                                    className="mt-2 px-4 py-2 rounded-xl text-sm border border-outline-variant text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">link_off</span>
                                    Liberar conductor
                                </button>
                            </form>
                        </div>
                    ) : (
                        <p className="text-sm text-secondary">Sin asignación activa.</p>
                    )}
                </div>
            </div>

            {/* D7 UIEstado — Cambio de estado (D5) */}
            {conductor.estado !== EstadoConductor.INACTIVO && (
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)] mb-6">
                    <h2 className="text-base font-semibold text-on-surface mb-4">Cambiar estado</h2>
                    <UIEstado
                        conductorID={conductor.conductorID}
                        estadoActual={conductor.estado}
                        tieneViajeActivo={tieneViajeActivo}
                    />
                </div>
            )}

            {/* D7 UIBaja */}
            {conductor.estado !== EstadoConductor.INACTIVO && (
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)] mb-6">
                    <h2 className="text-base font-semibold text-on-surface mb-4 text-error">Dar de baja</h2>
                    <UIBaja
                        conductorID={conductor.conductorID}
                        nombreCompleto={conductor.nombreCompleto}
                        estadoActual={conductor.estado}
                        tieneViajeActivo={tieneViajeActivo}
                    />
                </div>
            )}

            {/* Historial de asignaciones */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-base font-semibold text-on-surface mb-4">Historial de asignaciones</h2>
                {conductor.asignaciones.length === 0 ? (
                    <p className="text-sm text-secondary">Sin asignaciones registradas.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-secondary text-xs uppercase tracking-wider">
                                <th className="pb-2 text-left">Ruta</th>
                                <th className="pb-2 text-left">Fecha inicio</th>
                                <th className="pb-2 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {conductor.asignaciones.map(a => (
                                <tr key={a.asignacionID} className="py-2">
                                    <td className="py-2 text-on-surface">
                                        {a.horario.ruta.ciudadOrigen} → {a.horario.ruta.ciudadDestino}
                                    </td>
                                    <td className="py-2 text-secondary">
                                        {new Date(a.horario.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.liberado ? 'bg-surface-container-high text-secondary' : 'bg-primary-fixed text-primary'}`}>
                                            {a.liberado ? 'Liberado' : 'Activo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
