'use client'

import { useState } from 'react'
import { asignarAutobusAction } from '../actions'

const INPUT = 'w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40'
const LABEL = 'block text-sm font-medium text-on-surface mb-1.5'

interface OpcionConductor { conductorID: string; nombreCompleto: string }
interface OpcionHorario { horarioID: string; etiqueta: string }

interface Props {
    autobusID: string
    numeroEconomico: string
    conductores: OpcionConductor[]
    horarios: OpcionHorario[]
    onExito?: (asignacionID: string) => void
    onCancelar?: () => void
}

// D8: UIAsig — Pantalla Asignación Autobús a Conductor (D2/D4: vincular, validar compatibilidad, actualizar estado)
export function UIAsig({ autobusID, numeroEconomico, conductores, horarios, onExito, onCancelar }: Props) {
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setEnviando(true)
        setError(null)
        const fd = new FormData(e.currentTarget)
        fd.set('autobusID', autobusID)
        const resultado = await asignarAutobusAction(fd)
        setEnviando(false)
        if (resultado.exito) {
            setExito(true)
            onExito?.(resultado.asignacionID)
        } else {
            const mensajes: Record<string, string> = {
                autobus_no_disponible: 'El autobús no está disponible (D2: verificar estado activo).',
                conductor_no_activo:   'El conductor no está activo o disponible.',
                choque_horario:        'El autobús tiene conflicto de horario con ese viaje (D2).',
                en_mantenimiento:      'El autobús está en mantenimiento (D6).',
                error_bd:              'Error al guardar. Intenta de nuevo.',
            }
            setError(mensajes[resultado.motivo] ?? 'Error desconocido.')
        }
    }

    if (exito) {
        return (
            <div className="bg-primary-fixed text-primary rounded-xl px-5 py-4 text-sm flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                Asignación confirmada. <strong>{numeroEconomico}</strong> está ahora en servicio.
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-asignacion">
            <p className="text-sm text-secondary">
                Asignar <strong className="text-on-surface">{numeroEconomico}</strong> a un horario de viaje
            </p>

            <div className="space-y-4">
                <div>
                    <label className={LABEL}>Horario / Viaje <span className="text-error">*</span></label>
                    <select name="horarioID" required className={INPUT}>
                        <option value="">Seleccionar horario…</option>
                        {horarios.map(h => (
                            <option key={h.horarioID} value={h.horarioID}>{h.etiqueta}</option>
                        ))}
                    </select>
                    {horarios.length === 0 && (
                        <p className="text-xs text-secondary mt-1">No hay horarios activos sin asignación.</p>
                    )}
                </div>
                <div>
                    <label className={LABEL}>Conductor <span className="text-error">*</span></label>
                    <select name="conductorID" required className={INPUT}>
                        <option value="">Seleccionar conductor…</option>
                        {conductores.map(c => (
                            <option key={c.conductorID} value={c.conductorID}>{c.nombreCompleto}</option>
                        ))}
                    </select>
                    {conductores.length === 0 && (
                        <p className="text-xs text-secondary mt-1">No hay conductores activos disponibles.</p>
                    )}
                </div>
                <div>
                    <label className={LABEL}>Observaciones</label>
                    <textarea name="observaciones" rows={2}
                        className={`${INPUT} resize-none`}
                        placeholder="Notas adicionales para esta asignación…" />
                </div>
            </div>

            {error && (
                <div className="bg-error-container text-error text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button type="submit" disabled={enviando || horarios.length === 0 || conductores.length === 0}
                    className="flex-1 bg-linear-to-r from-primary to-primary-container text-on-primary font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">link</span>
                    {enviando ? 'Asignando…' : 'Confirmar asignación'}
                </button>
                {onCancelar && (
                    <button type="button" onClick={onCancelar}
                        className="px-5 py-2.5 bg-surface-container-low text-on-surface-variant font-medium rounded-xl hover:bg-surface-container-high transition-colors">
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}
