import { prisma } from '@/lib/prisma'
import { EstadoHorario, FrecuenciaHorario, VigenciaHorario } from '@prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cancelarHorario } from '../actions'

const FRECUENCIA_LABEL: Record<FrecuenciaHorario, string> = {
    UNICO: 'Único', DIARIO: 'Diario', SEMANAL: 'Semanal',
}
const VIGENCIA_LABEL: Record<VigenciaHorario, string> = {
    DEFINIDA: 'Definida', INDEFINIDA: 'Indefinida',
}
const ESTADO_COLORS: Record<EstadoHorario, string> = {
    ACTIVO:     'bg-primary-fixed text-primary',
    CANCELADO:  'bg-error-container text-error',
    COMPLETADO: 'bg-secondary-container text-secondary',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function HorarioDetallePage({ params }: PageProps) {
    const { id } = await params

    const horario = await prisma.horario.findUnique({
        where: { horarioID: id },
        include: {
            ruta:          { select: { codigoRuta: true, ciudadOrigen: true, ciudadDestino: true, distanciaKm: true, tiempoEstimadoHrs: true } },
            autobus:       { select: { numeroEconomico: true, marca: true, modelo: true, tipoServicio: true, capacidadAsientos: true } },
            conductor:     { select: { nombreCompleto: true, numeroLicencia: true, vigenciaLicencia: true } },
            programadoPor: { select: { nombreCompleto: true } },
        },
    })

    if (!horario) notFound()

    const activo = horario.estado === EstadoHorario.ACTIVO

    return (
        <div className="pt-8 pb-12 px-8 max-w-4xl mx-auto">

            <header className="mb-10">
                <div className="flex items-center gap-2 text-secondary text-sm mb-3">
                    <Link href="/admin/horarios" className="hover:text-primary transition-colors">
                        Horarios
                    </Link>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="font-mono">{horario.horarioID.slice(0, 8)}…</span>
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            {horario.ruta.ciudadOrigen} → {horario.ruta.ciudadDestino}
                        </h1>
                        <p className="text-secondary text-sm mt-1 font-mono">{horario.ruta.codigoRuta}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${ESTADO_COLORS[horario.estado]}`}>
                            {horario.estado}
                        </span>
                        {activo && (
                            <form action={cancelarHorario.bind(null, horario.horarioID)}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-error border border-error/30 hover:bg-error-container transition-colors text-sm font-semibold"
                                >
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Cancelar horario
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Programación */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Programación</h2>
                    <dl className="space-y-3">
                        <InfoRow label="Fecha de inicio" value={horario.fechaInicio.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} />
                        <InfoRow label="Hora de salida" value={new Date(horario.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} />
                        <InfoRow label="Frecuencia" value={FRECUENCIA_LABEL[horario.frecuencia]} />
                        <InfoRow label="Vigencia" value={VIGENCIA_LABEL[horario.vigencia]} />
                        {horario.fechaFin && (
                            <InfoRow label="Fecha de fin" value={horario.fechaFin.toLocaleDateString('es-MX')} />
                        )}
                        <InfoRow label="Precio base" value={`$${Number(horario.precioBase).toFixed(2)} MXN`} highlight />
                    </dl>
                </div>

                {/* Ruta */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Ruta</h2>
                    <dl className="space-y-3">
                        <InfoRow label="Código" value={horario.ruta.codigoRuta} mono />
                        <InfoRow label="Origen" value={horario.ruta.ciudadOrigen} />
                        <InfoRow label="Destino" value={horario.ruta.ciudadDestino} />
                        <InfoRow label="Distancia" value={`${Number(horario.ruta.distanciaKm)} km`} />
                        <InfoRow label="Tiempo estimado" value={`${Number(horario.ruta.tiempoEstimadoHrs)} hrs`} />
                    </dl>
                </div>

                {/* Autobús */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Autobús</h2>
                    <dl className="space-y-3">
                        <InfoRow label="Número económico" value={horario.autobus.numeroEconomico} mono />
                        <InfoRow label="Vehículo" value={`${horario.autobus.marca} ${horario.autobus.modelo}`} />
                        <InfoRow label="Tipo de servicio" value={horario.autobus.tipoServicio} />
                        <InfoRow label="Capacidad" value={`${horario.autobus.capacidadAsientos} asientos`} />
                    </dl>
                </div>

                {/* Conductor */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Conductor</h2>
                    <dl className="space-y-3">
                        <InfoRow label="Nombre" value={horario.conductor.nombreCompleto} />
                        <InfoRow label="Número de licencia" value={horario.conductor.numeroLicencia} mono />
                        <InfoRow label="Licencia vigente hasta" value={horario.conductor.vigenciaLicencia.toLocaleDateString('es-MX')} />
                    </dl>
                </div>

            </div>

            {/* Metadata */}
            <div className="mt-6 bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Registro</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoRow label="Programado por" value={horario.programadoPor.nombreCompleto} />
                    <InfoRow label="Creado" value={horario.creadoEn.toLocaleString('es-MX')} />
                    <InfoRow label="Última actualización" value={horario.actualizadoEn.toLocaleString('es-MX')} />
                </dl>
            </div>

        </div>
    )
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-baseline gap-4">
            <dt className="text-xs text-secondary shrink-0">{label}</dt>
            <dd className={`text-sm text-right ${mono ? 'font-mono' : ''} ${highlight ? 'font-bold text-primary' : 'text-on-surface'}`}>
                {value}
            </dd>
        </div>
    )
}
