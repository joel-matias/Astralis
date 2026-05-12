'use client'

// D7, D6 CU6 — UIAsig: Pantalla Asignación Conductor a Viaje
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { asignarConductorAction, obtenerConductoresParaViajeAction, registrarAbandonoAction } from '../actions'
import { EstadoConductor } from '@prisma/client'

interface Viaje {
    horarioID: string
    ruta: {
        nombreRuta: string
        ciudadOrigen: string
        ciudadDestino: string
        tiempoEstimadoHrs: number
    }
    conductor: { nombreCompleto: string } | null
    asignacionActiva: boolean
    fechaInicio: Date
    horaSalida: Date
}

interface ConductorFiltrado {
    conductorID: string
    nombreCompleto: string
    curp: string
    vigenciaLicencia: Date
    estado: EstadoConductor
}

interface Props {
    viajes: Viaje[]
}

export default function UIAsig({ viajes }: Props) {
    const router = useRouter()
    const [viajeSeleccionado, setViajeSeleccionado] = useState<string | null>(null)
    const [conductoresDisponibles, setConductoresDisponibles] = useState<ConductorFiltrado[]>([])
    const [cargandoConductores, setCargandoConductores] = useState(false)
    const [conductorSeleccionado, setConductorSeleccionado] = useState<string | null>(null)
    const [observaciones, setObservaciones] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [confirmarCancelar, setConfirmarCancelar] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [isPending, startTransition] = useTransition()

    const viajesFiltrados = busqueda.trim() === ''
        ? viajes
        : viajes.filter(v =>
            v.ruta.ciudadOrigen.toLowerCase().includes(busqueda.toLowerCase()) ||
            v.ruta.ciudadDestino.toLowerCase().includes(busqueda.toLowerCase()) ||
            v.ruta.nombreRuta.toLowerCase().includes(busqueda.toLowerCase())
        )

    // D7 paso 3: seleccionar viaje → cargar conductores candidatos filtrados (paso 5)
    async function seleccionarViaje(horarioID: string) {
        setViajeSeleccionado(horarioID)
        setConductorSeleccionado(null)
        setError(null)
        setCargandoConductores(true)
        try {
            const conductores = await obtenerConductoresParaViajeAction(horarioID)
            setConductoresDisponibles(conductores)
        } catch {
            setError('Error al cargar conductores disponibles')
        } finally {
            setCargandoConductores(false)
        }
    }

    function confirmarAsignacion() {
        if (!viajeSeleccionado || !conductorSeleccionado) {
            setError('Selecciona un viaje y un conductor')
            return
        }
        startTransition(async () => {
            const res = await asignarConductorAction(conductorSeleccionado, viajeSeleccionado, observaciones)
            if (res.ok) setExito(true)
            else {
                setError(res.error ?? 'Error al asignar')
                // E1.1: viaje ya no existe → regresar al paso 2
                if (res.error === 'Viaje no encontrado') {
                    setViajeSeleccionado(null)
                    setConductorSeleccionado(null)
                    setConductoresDisponibles([])
                }
            }
        })
    }

    // S1.2: registrar abandono y navegar fuera
    async function ejecutarCancelar() {
        await registrarAbandonoAction()
        router.push('/admin/conductores')
    }

    const viajeActual = viajes.find(v => v.horarioID === viajeSeleccionado)

    if (exito) {
        return (
            <div className="bg-primary-fixed/20 border border-primary rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-primary mb-2 block">assignment_turned_in</span>
                <p className="text-on-surface font-semibold">Conductor asignado correctamente</p>
                <button onClick={() => {
                    setExito(false)
                    setViajeSeleccionado(null)
                    setConductorSeleccionado(null)
                    setObservaciones('')
                    setConductoresDisponibles([])
                }} className="mt-4 text-primary hover:underline text-sm">
                    Hacer otra asignación
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* S1: Diálogo de confirmación al cancelar */}
            {confirmarCancelar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-base font-semibold text-on-surface mb-2">¿Cancelar la asignación?</h3>
                        <p className="text-sm text-secondary">Los cambios no se guardarán.</p>
                        <div className="flex gap-3 justify-end mt-5">
                            <button onClick={() => setConfirmarCancelar(false)}
                                className="px-4 py-2 text-sm text-secondary hover:text-on-surface transition-colors">
                                Continuar asignando
                            </button>
                            <button onClick={ejecutarCancelar}
                                className="px-4 py-2 bg-error text-on-error rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div data-testid="asig-error"
                    className="bg-error-container text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            {/* Paso 2: Selección de viaje — incluye buscador y viajes con conductor para reasignación */}
            <div>
                <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">directions_bus</span>
                    1. Selecciona el viaje
                </h3>
                <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por origen o destino…"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-3"
                />
                {viajesFiltrados.length === 0 ? (
                    <p className="text-sm text-secondary">
                        {viajes.length === 0 ? 'No hay viajes programados.' : 'Sin resultados para la búsqueda.'}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {viajesFiltrados.map(v => (
                            <button key={v.horarioID}
                                onClick={() => seleccionarViaje(v.horarioID)}
                                className={`text-left p-4 rounded-xl border-2 transition-all ${
                                    viajeSeleccionado === v.horarioID
                                        ? 'border-primary bg-primary-fixed/20'
                                        : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'
                                }`}>
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-on-surface text-sm">
                                        {v.ruta.ciudadOrigen} → {v.ruta.ciudadDestino}
                                    </p>
                                    {v.asignacionActiva && (
                                        <span className="shrink-0 text-xs bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
                                            Reasignar
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-secondary mt-1">
                                    {new Date(v.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })} ·{' '}
                                    {new Date(v.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {v.asignacionActiva && v.conductor && (
                                    <p className="text-xs text-tertiary mt-1">
                                        Conductor actual: {v.conductor.nombreCompleto}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Paso 4: Información del viaje seleccionado — fecha/hora, ruta, duración estimada */}
            {viajeActual && (
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">Detalle del viaje</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                        <span className="text-secondary">Ruta</span>
                        <span className="text-on-surface">{viajeActual.ruta.ciudadOrigen} → {viajeActual.ruta.ciudadDestino}</span>
                        <span className="text-secondary">Fecha</span>
                        <span className="text-on-surface">
                            {new Date(viajeActual.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                        </span>
                        <span className="text-secondary">Hora de salida</span>
                        <span className="text-on-surface">
                            {new Date(viajeActual.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-secondary">Duración estimada</span>
                        <span className="text-on-surface">{viajeActual.ruta.tiempoEstimadoHrs} hrs</span>
                    </div>
                </div>
            )}

            {/* Paso 5: Conductores candidatos — pre-filtrados por estado, licencia y choque de horario */}
            {viajeSeleccionado && (
                <div>
                    <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        2. Selecciona el conductor
                    </h3>
                    {cargandoConductores ? (
                        <p className="text-sm text-secondary flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">progress_activity</span>
                            Cargando conductores disponibles…
                        </p>
                    ) : conductoresDisponibles.length === 0 ? (
                        /* E2: Sin disponibilidad */
                        <div data-testid="sin-conductores" className="space-y-1">
                            <p className="text-sm text-error flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">warning</span>
                                Sin disponibilidad: no hay conductores activos con licencia vigente y sin choque de horario.
                            </p>
                            <p className="text-sm text-secondary pl-6">
                                Selecciona otro viaje o verifica la disponibilidad de los conductores.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {conductoresDisponibles.map(c => (
                                <button key={c.conductorID}
                                    onClick={() => { setConductorSeleccionado(c.conductorID); setError(null) }}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                                        conductorSeleccionado === c.conductorID
                                            ? 'border-primary bg-primary-fixed/20'
                                            : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'
                                    }`}>
                                    <p className="font-semibold text-on-surface text-sm">{c.nombreCompleto}</p>
                                    <p className="text-xs text-secondary mt-1">CURP: {c.curp}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Observaciones y confirmación */}
            {viajeSeleccionado && conductorSeleccionado && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Observaciones</label>
                        <input value={observaciones} onChange={e => setObservaciones(e.target.value)}
                            placeholder="Observaciones opcionales"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={confirmarAsignacion} disabled={isPending}
                            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity">
                            <span className="material-symbols-outlined">assignment_ind</span>
                            {isPending ? 'Asignando…' : (viajeActual?.asignacionActiva ? 'Confirmar reasignación' : 'Confirmar asignación')}
                        </button>
                        {/* S1: botón cancelar con diálogo de confirmación */}
                        <button onClick={() => setConfirmarCancelar(true)}
                            className="px-6 py-3 text-secondary hover:text-on-surface border border-outline-variant rounded-xl text-sm transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* S1: cancelar cuando hay viaje seleccionado pero aún no conductor */}
            {viajeSeleccionado && !conductorSeleccionado && (
                <button onClick={() => setConfirmarCancelar(true)}
                    className="text-sm text-secondary hover:text-on-surface flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-base">close</span>
                    Cancelar asignación
                </button>
            )}
        </div>
    )
}
