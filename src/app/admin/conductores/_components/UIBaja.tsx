'use client'

// D7 CU6 — UIBaja: Pantalla Baja Conductor — flujo completo de dar de baja con registro de motivo
import { useState, useTransition } from 'react'
import { darDeBajaAction } from '../actions'
import { EstadoConductor } from '@prisma/client'

interface Props {
    conductorID: string
    nombreCompleto: string
    estadoActual: EstadoConductor
    tieneViajeActivo: boolean
}

export default function UIBaja({ conductorID, nombreCompleto, estadoActual, tieneViajeActivo }: Props) {
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [confirmar, setConfirmar] = useState(false)
    const [isPending, startTransition] = useTransition()

    if (estadoActual === EstadoConductor.INACTIVO) {
        return (
            <p className="text-sm text-secondary">Este conductor ya está dado de baja.</p>
        )
    }

    // D5: no puede darse de baja si tiene viaje activo
    if (tieneViajeActivo) {
        return (
            <div className="bg-error-container/30 border border-error-container rounded-xl p-4 text-sm text-error flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5">warning</span>
                No puede darse de baja: el conductor tiene un viaje activo. Libéralo primero.
            </div>
        )
    }

    if (exito) {
        return (
            <div className="bg-error-container/20 border border-error rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-error mb-2 block">person_off</span>
                <p className="text-on-surface font-semibold">{nombreCompleto} dado de baja</p>
                <a href="/admin/conductores"
                    className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm">
                    Volver a la lista
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
            </div>
        )
    }

    function handleBaja() {
        if (!motivo.trim()) { setError('El motivo es obligatorio'); return }
        setConfirmar(true)
    }

    function handleConfirmar() {
        startTransition(async () => {
            const res = await darDeBajaAction(conductorID, motivo)
            if (res.ok) setExito(true)
            else setError(res.error ?? 'Error al dar de baja')
        })
    }

    return (
        <div className="space-y-4">
            {error && (
                <div data-testid="baja-error"
                    className="bg-error-container text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            {!confirmar ? (
                <>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Motivo de baja *</label>
                        <input value={motivo} onChange={e => setMotivo(e.target.value)}
                            placeholder="Ej. Renuncia voluntaria, Término de contrato"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <button onClick={handleBaja}
                        className="bg-error text-on-error px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">person_off</span>
                        Dar de baja
                    </button>
                </>
            ) : (
                <div className="bg-error-container/30 border border-error rounded-xl p-5 space-y-4">
                    <p className="text-on-surface text-sm font-medium">
                        ¿Confirmar baja de <span className="font-bold">{nombreCompleto}</span>?
                    </p>
                    <p className="text-xs text-secondary">Motivo: {motivo}</p>
                    <div className="flex gap-3">
                        <button onClick={handleConfirmar} disabled={isPending}
                            className="bg-error text-on-error px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                            {isPending ? 'Procesando…' : 'Confirmar baja'}
                        </button>
                        <button onClick={() => setConfirmar(false)}
                            className="px-4 py-2 rounded-xl text-sm text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
