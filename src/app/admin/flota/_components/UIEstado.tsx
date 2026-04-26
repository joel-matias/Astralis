'use client'

import { useState } from 'react'
import { cambiarEstadoAutobusAction } from '../actions'
import { EstadoAutobus } from '@prisma/client'

// D6 — transiciones válidas según el Diagrama de Estados del Autobús
const TRANSICIONES: Record<EstadoAutobus, { hacia: EstadoAutobus; etiqueta: string; icono: string; clase: string }[]> = {
    DISPONIBLE: [
        { hacia: 'EN_MANTENIMIENTO',  etiqueta: 'Iniciar mantenimiento', icono: 'build',  clase: 'bg-tertiary-container text-tertiary hover:bg-tertiary/20' },
        { hacia: 'FUERA_DE_SERVICIO', etiqueta: 'Registrar falla grave', icono: 'block',  clase: 'bg-error-container text-error hover:bg-error/20' },
    ],
    ASIGNADO: [],
    EN_MANTENIMIENTO: [
        { hacia: 'DISPONIBLE',        etiqueta: 'Cerrar mantenimiento',   icono: 'check_circle', clase: 'bg-primary-fixed text-primary hover:bg-primary/20' },
        { hacia: 'FUERA_DE_SERVICIO', etiqueta: 'No reparable — baja',    icono: 'block',        clase: 'bg-error-container text-error hover:bg-error/20' },
    ],
    FUERA_DE_SERVICIO: [
        { hacia: 'DISPONIBLE',        etiqueta: 'Reactivar',              icono: 'check_circle', clase: 'bg-primary-fixed text-primary hover:bg-primary/20' },
        { hacia: 'EN_MANTENIMIENTO',  etiqueta: 'Iniciar reparación',     icono: 'build',        clase: 'bg-tertiary-container text-tertiary hover:bg-tertiary/20' },
    ],
}

interface Props {
    autobusID: string
    estadoActual: EstadoAutobus
    numeroEconomico: string
    onCambio?: () => void
}

// D8: UIEstado — Pantalla Cambio Estado Autobús
export function UIEstado({ autobusID, estadoActual, numeroEconomico, onCambio }: Props) {
    const [motivo, setMotivo] = useState('')
    const [procesando, setProcesando] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

    const opciones = TRANSICIONES[estadoActual] ?? []

    async function cambiar(nuevoEstado: EstadoAutobus) {
        if (!motivo.trim()) {
            setMensaje({ tipo: 'error', texto: 'Indica el motivo del cambio de estado.' })
            return
        }
        setProcesando(true)
        setMensaje(null)
        const resultado = await cambiarEstadoAutobusAction(autobusID, nuevoEstado, motivo)
        setProcesando(false)
        if (resultado.exito) {
            setMensaje({ tipo: 'exito', texto: `Estado cambiado: ${resultado.estadoAnterior} → ${resultado.estadoNuevo}` })
            setMotivo('')
            onCambio?.()
        } else {
            const mensajes: Record<string, string> = {
                transicion_invalida: 'Transición no permitida según el diagrama de estados.',
                tiene_mto_abierto: 'Existe un mantenimiento abierto. Ciérralo antes de cambiar el estado.',
                error_bd: 'Error al guardar el cambio. Intenta de nuevo.',
            }
            setMensaje({ tipo: 'error', texto: mensajes[resultado.motivo] ?? 'Error desconocido.' })
        }
    }

    if (opciones.length === 0) {
        return (
            <div className="bg-secondary-container rounded-xl px-5 py-4 text-sm text-secondary flex items-start gap-3">
                <span className="material-symbols-outlined text-xl shrink-0">info</span>
                <p>
                    <strong>{numeroEconomico}</strong> está <strong>ASIGNADO</strong> a un viaje activo.
                    Debe finalizar el viaje antes de cambiar el estado (D6).
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4" data-testid="panel-estado">
            <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Motivo del cambio <span className="text-error">*</span>
                </label>
                <textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    rows={2}
                    placeholder="Describe el motivo del cambio de estado…"
                    className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-secondary resize-none"
                />
            </div>

            {mensaje && (
                <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                    mensaje.tipo === 'error' ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
                }`} data-testid={`${mensaje.tipo}-estado`}>
                    <span className="material-symbols-outlined text-base">
                        {mensaje.tipo === 'error' ? 'error' : 'check_circle'}
                    </span>
                    {mensaje.texto}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {opciones.map(op => (
                    <button key={op.hacia} onClick={() => cambiar(op.hacia)} disabled={procesando}
                        className={`${op.clase} font-medium text-sm py-2.5 px-5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2`}>
                        <span className="material-symbols-outlined text-base">{op.icono}</span>
                        {procesando ? 'Procesando…' : op.etiqueta}
                    </button>
                ))}
            </div>
        </div>
    )
}
