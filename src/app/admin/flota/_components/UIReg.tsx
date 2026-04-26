'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarAutobusAction } from '../actions'
import { TipoServicio } from '@prisma/client'

const TIPOS: { valor: TipoServicio; etiqueta: string }[] = [
    { valor: 'ECONOMICO', etiqueta: 'Económico' },
    { valor: 'EJECUTIVO', etiqueta: 'Ejecutivo' },
    { valor: 'LUJO',      etiqueta: 'Primera (Lujo)' },
]

const INPUT = 'w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-secondary'
const LABEL = 'block text-sm font-medium text-on-surface mb-1.5'

// D8: UIReg — Formulario Registro Autobús  (D3/D7: capturarDatos → validar → guardar → confirmar)
export function UIReg() {
    const router = useRouter()
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setEnviando(true)
        setError(null)
        const resultado = await registrarAutobusAction(new FormData(e.currentTarget))
        setEnviando(false)
        if (resultado.exito) {
            router.push(`/admin/flota/${resultado.autobusID}`)
        } else {
            const mensajes: Record<string, string> = {
                campos_faltantes: 'Faltan campos obligatorios.',
                formato_invalido: 'Formato inválido en placas (5-10 alfanum.), VIN (17 chars) o año.',
                duplicado: 'Ya existe un autobús con esas placas, número económico o VIN.',
                error_bd: 'Error al guardar. Intenta de nuevo.',
            }
            setError(mensajes[resultado.motivo] ?? 'Error desconocido.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-registro-autobus">

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Identificación del vehículo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL}>Número económico <span className="text-error">*</span></label>
                        <input name="numeroEconomico" required placeholder="ECO-001" className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Placas <span className="text-error">*</span></label>
                        <input name="placas" required placeholder="ABC-123" className={INPUT} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={LABEL}>VIN (17 caracteres) <span className="text-error">*</span></label>
                        <input name="vin" required maxLength={17} minLength={17}
                            placeholder="1HGBH41JXMN109186"
                            className={`${INPUT} font-mono`} />
                        <p className="text-xs text-secondary mt-1">Número de identificación vehicular — exactamente 17 caracteres</p>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Datos del vehículo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL}>Marca <span className="text-error">*</span></label>
                        <input name="marca" required placeholder="Mercedes-Benz" className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Modelo <span className="text-error">*</span></label>
                        <input name="modelo" required placeholder="Tourismo" className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Año <span className="text-error">*</span></label>
                        <input name="anio" type="number" required
                            min={1990} max={new Date().getFullYear() + 1}
                            placeholder={String(new Date().getFullYear())} className={INPUT} />
                    </div>
                    <div>
                        <label className={LABEL}>Capacidad de asientos <span className="text-error">*</span></label>
                        <input name="capacidadAsientos" type="number" required min={9} max={60}
                            placeholder="40" className={INPUT} />
                        <p className="text-xs text-secondary mt-1">Mínimo 9 asientos (D1)</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className={LABEL}>Tipo de autobús <span className="text-error">*</span></label>
                        <select name="tipoAutobus" required className={INPUT}>
                            <option value="">Seleccionar tipo…</option>
                            {TIPOS.map(t => (
                                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div data-testid="error-registro"
                    className="bg-error-container text-error text-sm rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button type="submit" disabled={enviando}
                    className="flex-1 bg-linear-to-r from-primary to-primary-container text-on-primary font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">{enviando ? 'hourglass_empty' : 'directions_bus'}</span>
                    {enviando ? 'Registrando…' : 'Registrar autobús'}
                </button>
            </div>
        </form>
    )
}
