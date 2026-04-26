'use client'

import { useState } from 'react'
import { actualizarAutobusAction } from '../actions'
import { TipoServicio } from '@prisma/client'

const TIPOS: { valor: TipoServicio; etiqueta: string }[] = [
    { valor: 'ECONOMICO', etiqueta: 'Económico' },
    { valor: 'EJECUTIVO', etiqueta: 'Ejecutivo' },
    { valor: 'LUJO',      etiqueta: 'Primera (Lujo)' },
]

const INPUT = 'w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-secondary'
const LABEL = 'block text-sm font-medium text-on-surface mb-1.5'

interface DatosAutobus {
    autobusID: string
    marca: string
    modelo: string
    capacidadAsientos: number
    tipoServicio: TipoServicio
}

interface Props {
    autobus: DatosAutobus
    onExito?: () => void
    onCancelar?: () => void
}

// D8: UIAct — Formulario Actualizar Autobús
export function UIAct({ autobus, onExito, onCancelar }: Props) {
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setEnviando(true)
        setError(null)
        const resultado = await actualizarAutobusAction(autobus.autobusID, new FormData(e.currentTarget))
        setEnviando(false)
        if (resultado.exito) {
            setExito(true)
            onExito?.()
        } else {
            setError('Error al actualizar. Intenta de nuevo.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-actualizar-autobus">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={LABEL}>Marca</label>
                    <input name="marca" defaultValue={autobus.marca} className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Modelo</label>
                    <input name="modelo" defaultValue={autobus.modelo} className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Capacidad de asientos</label>
                    <input name="capacidadAsientos" type="number" min={9} max={60}
                        defaultValue={autobus.capacidadAsientos} className={INPUT} />
                </div>
                <div>
                    <label className={LABEL}>Tipo de autobús</label>
                    <select name="tipoAutobus" defaultValue={autobus.tipoServicio} className={INPUT}>
                        {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-error-container text-error text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}
            {exito && (
                <div className="bg-primary-fixed text-primary text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Cambios guardados correctamente.
                </div>
            )}

            <div className="flex gap-3 pt-1">
                <button type="submit" disabled={enviando}
                    className="flex-1 bg-linear-to-r from-primary to-primary-container text-on-primary font-semibold py-2.5 px-5 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                    {enviando ? 'Guardando…' : 'Guardar cambios'}
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
