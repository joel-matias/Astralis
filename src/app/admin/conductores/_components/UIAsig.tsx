'use client'

// D7, D6 CU6 — UIAsig: Pantalla Asignación Conductor a Viaje — implementa flujo del D6 (Diagrama de Secuencia)
import { useState, useTransition } from 'react'
import { asignarConductorAction } from '../actions'
import { EstadoConductor } from '@prisma/client'

interface Horario {
    horarioID: string
    ruta: { nombreRuta: string; ciudadOrigen: string; ciudadDestino: string }
    conductor: { nombreCompleto: string } | null
    fechaInicio: Date
    horaSalida: Date
}

interface Conductor {
    conductorID: string
    nombreCompleto: string
    curp: string
    vigenciaLicencia: Date
    estado: EstadoConductor
}

interface Props {
    viajes: Horario[]
    conductores: Conductor[]
}

export default function UIAsig({ viajes, conductores }: Props) {
    const [viajeSeleccionado, setViajeSeleccionado] = useState<string | null>(null)
    const [conductorSeleccionado, setConductorSeleccionado] = useState<string | null>(null)
    const [observaciones, setObservaciones] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [isPending, startTransition] = useTransition()

    // D6: obtener lista de conductores disponibles filtrada
    const conductoresActivos = conductores.filter(c => c.estado === EstadoConductor.ACTIVO)

    function handleAsignar() {
        if (!viajeSeleccionado || !conductorSeleccionado) {
            setError('Selecciona un viaje y un conductor')
            return
        }
        startTransition(async () => {
            const res = await asignarConductorAction(conductorSeleccionado, viajeSeleccionado, observaciones)
            if (res.ok) setExito(true)
            else setError(res.error ?? 'Error al asignar')
        })
    }

    if (exito) {
        return (
            <div className="bg-primary-fixed/20 border border-primary rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-primary mb-2 block">assignment_turned_in</span>
                <p className="text-on-surface font-semibold">Conductor asignado correctamente</p>
                <button onClick={() => { setExito(false); setViajeSeleccionado(null); setConductorSeleccionado(null); setObservaciones('') }}
                    className="mt-4 text-primary hover:underline text-sm">
                    Hacer otra asignación
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {error && (
                <div data-testid="asig-error"
                    className="bg-error-container text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            {/* D6 paso 1-4: selección de viaje */}
            <div>
                <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">directions_bus</span>
                    1. Selecciona el viaje a asignar
                </h3>
                {viajes.length === 0 ? (
                    <p className="text-sm text-secondary">No hay viajes programados sin conductor.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {viajes.map(v => (
                            <button key={v.horarioID}
                                onClick={() => { setViajeSeleccionado(v.horarioID); setError(null) }}
                                className={`text-left p-4 rounded-xl border-2 transition-all ${viajeSeleccionado === v.horarioID ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'}`}>
                                <p className="font-semibold text-on-surface text-sm">{v.ruta.ciudadOrigen} → {v.ruta.ciudadDestino}</p>
                                <p className="text-xs text-secondary mt-1">
                                    {new Date(v.fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })} ·
                                    {new Date(v.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* D6 paso 5-11: selección de conductor */}
            {viajeSeleccionado && (
                <div>
                    <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        2. Selecciona el conductor
                    </h3>
                    {conductoresActivos.length === 0 ? (
                        /* D6 E2: Sin disponibilidad */
                        <p className="text-sm text-error flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">warning</span>
                            Sin disponibilidad: no hay conductores activos.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {conductoresActivos.map(c => {
                                const licenciaVigente = new Date(c.vigenciaLicencia) > new Date()
                                return (
                                    <button key={c.conductorID}
                                        disabled={!licenciaVigente}
                                        onClick={() => { setConductorSeleccionado(c.conductorID); setError(null) }}
                                        className={`text-left p-4 rounded-xl border-2 transition-all ${conductorSeleccionado === c.conductorID ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'} ${!licenciaVigente ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                        <p className="font-semibold text-on-surface text-sm">{c.nombreCompleto}</p>
                                        <p className="text-xs text-secondary mt-1">CURP: {c.curp}</p>
                                        {!licenciaVigente && (
                                            /* D6 E4: Licencia vencida */
                                            <span className="text-xs text-error font-medium">Licencia vencida</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Observaciones y confirmar */}
            {viajeSeleccionado && conductorSeleccionado && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Observaciones</label>
                        <input value={observaciones} onChange={e => setObservaciones(e.target.value)}
                            placeholder="Observaciones opcionales"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <button onClick={handleAsignar} disabled={isPending}
                        className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity">
                        <span className="material-symbols-outlined">assignment_ind</span>
                        {isPending ? 'Asignando…' : 'Confirmar asignación'}
                    </button>
                </div>
            )}
        </div>
    )
}
