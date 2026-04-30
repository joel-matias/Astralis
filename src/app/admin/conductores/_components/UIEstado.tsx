'use client'

// D7, D5 CU6 — UIEstado: Pantalla Cambio Estado Conductor — controla transiciones del D5 (Diagrama de Estados)
import { useState, useTransition } from 'react'
import { cambiarEstadoAction } from '../actions'
import { EstadoConductor } from '@prisma/client'

interface Props {
    conductorID: string
    estadoActual: EstadoConductor
    tieneViajeActivo: boolean
}

const ESTADO_LABEL: Record<EstadoConductor, string> = {
    ACTIVO:        'Activo',
    NO_DISPONIBLE: 'No Disponible',
    INACTIVO:      'Inactivo / Baja',
}

export default function UIEstado({ conductorID, estadoActual, tieneViajeActivo }: Props) {
    const [accion, setAccion] = useState<string | null>(null)
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleConfirmar() {
        if (!accion) return
        if ((accion === 'NO_DISPONIBLE' || accion === 'INACTIVO') && !motivo.trim()) {
            setError('El motivo es obligatorio')
            return
        }
        startTransition(async () => {
            const res = await cambiarEstadoAction(conductorID, accion, motivo)
            if (res.ok) {
                setExito(true)
                setTimeout(() => window.location.reload(), 1000)
            } else {
                setError(res.error ?? 'Error al cambiar estado')
            }
        })
    }

    if (exito) {
        return (
            <div className="flex items-center gap-2 text-primary text-sm">
                <span className="material-symbols-outlined">check_circle</span>
                Estado actualizado
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {error && (
                <div data-testid="estado-error"
                    className="bg-error-container text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {/* D5: Activo → NoDisponible/Temporal */}
                {estadoActual === EstadoConductor.ACTIVO && (
                    <button onClick={() => { setAccion('NO_DISPONIBLE'); setError(null) }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${accion === 'NO_DISPONIBLE' ? 'bg-secondary-container text-secondary border-secondary' : 'border-outline-variant text-secondary hover:bg-surface-container-low'}`}>
                        <span className="material-symbols-outlined text-base mr-1 align-middle">pause_circle</span>
                        Suspender temporalmente
                    </button>
                )}

                {/* D5: NoDisponible/Temporal → Activo */}
                {estadoActual === EstadoConductor.NO_DISPONIBLE && !tieneViajeActivo && (
                    <button onClick={() => { setAccion('ACTIVO'); setError(null) }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${accion === 'ACTIVO' ? 'bg-primary-fixed text-primary border-primary' : 'border-outline-variant text-secondary hover:bg-surface-container-low'}`}>
                        <span className="material-symbols-outlined text-base mr-1 align-middle">play_circle</span>
                        Reactivar
                    </button>
                )}

                {/* D5: Activo/NoDisponible → Inactivo/Baja (solo sin viaje activo) */}
                {estadoActual !== EstadoConductor.INACTIVO && !tieneViajeActivo && (
                    <button onClick={() => { setAccion('INACTIVO'); setError(null) }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${accion === 'INACTIVO' ? 'bg-error-container text-error border-error' : 'border-outline-variant text-error hover:bg-error-container/50'}`}>
                        <span className="material-symbols-outlined text-base mr-1 align-middle">person_off</span>
                        Dar de baja
                    </button>
                )}
            </div>

            {/* D5: mensaje si tiene viaje activo */}
            {tieneViajeActivo && (
                <p className="text-sm text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">info</span>
                    Conductor asignado a viaje activo. Primero libéralo para cambiar estado.
                </p>
            )}

            {accion && accion !== 'ACTIVO' && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-on-surface-variant">
                        {accion === 'INACTIVO' ? 'Motivo de baja *' : 'Motivo *'}
                    </label>
                    <input value={motivo} onChange={e => setMotivo(e.target.value)}
                        placeholder={accion === 'INACTIVO' ? 'Ej. Renuncia voluntaria' : 'Ej. Vacaciones, Incapacidad'}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
            )}

            {accion && (
                <div className="flex gap-3">
                    <button onClick={handleConfirmar} disabled={isPending}
                        className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {isPending ? 'Aplicando…' : `Confirmar → ${ESTADO_LABEL[accion as EstadoConductor]}`}
                    </button>
                    <button onClick={() => { setAccion(null); setMotivo(''); setError(null) }}
                        className="px-4 py-2 rounded-xl text-sm text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    )
}
