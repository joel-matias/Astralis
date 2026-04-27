'use client'

import { useState } from 'react'
import { crearHorario } from '../actions'

function fechaLocal(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Ruta {
    rutaID: string
    codigoRuta: string
    ciudadOrigen: string
    ciudadDestino: string
    tarifaBase: number
}

interface Autobus {
    autobusID: string
    numeroEconomico: string
    tipoServicio: string
    capacidadAsientos: number
}

interface Conductor {
    conductorID: string
    nombreCompleto: string
    vigenciaLicencia: Date
}

interface Props {
    rutas: Ruta[]
    autobuses: Autobus[]
    conductores: Conductor[]
}

export function NuevoHorarioForm({ rutas, autobuses, conductores }: Props) {
    const [rutaID, setRutaID]       = useState('')
    const [vigencia, setVigencia]   = useState('INDEFINIDA')
    const [precioBase, setPrecioBase] = useState('')

    const rutaSeleccionada = rutas.find(r => r.rutaID === rutaID)

    function handleRutaChange(id: string) {
        setRutaID(id)
        const r = rutas.find(r => r.rutaID === id)
        if (r) setPrecioBase(String(Number(r.tarifaBase)))
    }

    return (
        <form action={crearHorario} className="space-y-8">

            {/* Ruta */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Ruta
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Ruta <span className="text-error">*</span>
                        </label>
                        <select
                            name="rutaID"
                            required
                            value={rutaID}
                            onChange={e => handleRutaChange(e.target.value)}
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Selecciona una ruta activa…</option>
                            {rutas.map(r => (
                                <option key={r.rutaID} value={r.rutaID}>
                                    {r.codigoRuta} — {r.ciudadOrigen} → {r.ciudadDestino}
                                </option>
                            ))}
                        </select>
                        {rutaSeleccionada && (
                            <p className="mt-1.5 text-xs text-secondary">
                                Tarifa base: <span className="font-semibold text-primary">${Number(rutaSeleccionada.tarifaBase).toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recursos */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Recursos asignados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Autobús <span className="text-error">*</span>
                        </label>
                        <select
                            name="autobusID"
                            required
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Selecciona un autobús disponible…</option>
                            {autobuses.map(a => (
                                <option key={a.autobusID} value={a.autobusID}>
                                    {a.numeroEconomico} — {a.tipoServicio} ({a.capacidadAsientos} asientos)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Conductor <span className="text-error">*</span>
                        </label>
                        <select
                            name="conductorID"
                            required
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Selecciona un conductor activo…</option>
                            {conductores.map(c => (
                                <option key={c.conductorID} value={c.conductorID}>
                                    {c.nombreCompleto} — licencia vigente hasta {new Date(c.vigenciaLicencia).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Horario */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Programación
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Fecha de inicio <span className="text-error">*</span>
                        </label>
                        <input
                            type="date"
                            name="fechaInicio"
                            required
                            min={fechaLocal()}
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Hora de salida <span className="text-error">*</span>
                        </label>
                        <input
                            type="time"
                            name="horaSalida"
                            required
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Frecuencia <span className="text-error">*</span>
                        </label>
                        <select
                            name="frecuencia"
                            required
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="UNICO">Único</option>
                            <option value="DIARIO">Diario</option>
                            <option value="SEMANAL">Semanal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5">
                            Vigencia <span className="text-error">*</span>
                        </label>
                        <select
                            name="vigencia"
                            required
                            value={vigencia}
                            onChange={e => setVigencia(e.target.value)}
                            className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="INDEFINIDA">Indefinida</option>
                            <option value="DEFINIDA">Definida</option>
                        </select>
                    </div>
                    {vigencia === 'DEFINIDA' && (
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">
                                Fecha de fin <span className="text-error">*</span>
                            </label>
                            <input
                                type="date"
                                name="fechaFin"
                                required
                                min={fechaLocal()}
                                className="w-full bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Precio */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    Precio
                </h2>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                        Precio base (MXN) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-semibold text-sm">$</span>
                        <input
                            type="number"
                            name="precioBase"
                            required
                            min="0"
                            step="0.01"
                            value={precioBase}
                            onChange={e => setPrecioBase(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-surface-container-high rounded-xl pl-8 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-secondary">
                        Pre-llenado desde la tarifa base de la ruta seleccionada.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <a
                    href="/admin/horarios"
                    className="px-6 py-3 rounded-xl text-secondary font-semibold hover:bg-surface-container-high transition-colors"
                >
                    Cancelar
                </a>
                <button
                    type="submit"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    Programar horario
                </button>
            </div>
        </form>
    )
}
