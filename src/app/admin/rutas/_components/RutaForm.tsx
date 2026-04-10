'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TipoRuta } from '@prisma/client'
import type { RutaFormData, ParadaFormData } from '../actions'
import { CityInput } from './CityInput'

interface ParadaItem extends ParadaFormData {
    key: string
}

const PARADA_VACIA = {
    nombreParada: '',
    ciudad: '',
    distanciaDesdeOrigenKm: '',
    tiempoEsperaMin: '',
    tarifaDesdeOrigen: '',
}

interface Props {
    modo: 'crear' | 'editar'
    action: (data: RutaFormData) => Promise<{ error: string } | { warning: string } | void>
    defaultValues?: Partial<{
        codigoRuta: string
        tipoRuta: TipoRuta
        tarifaBase: number
        ciudadOrigen: string
        terminalOrigen: string
        ciudadDestino: string
        terminalDestino: string
        distanciaKm: number
        tiempoEstimadoHrs: number
    }>
    defaultParadas?: ParadaFormData[]
}

export function RutaForm({ modo, action, defaultValues = {}, defaultParadas = [] }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [warning, setWarning] = useState<string | null>(null)
    const lastDataRef = useRef<RutaFormData | null>(null)

    const [tipoRuta, setTipoRuta] = useState<TipoRuta>(
        defaultValues.tipoRuta ?? TipoRuta.DIRECTA
    )

    const [paradas, setParadas] = useState<ParadaItem[]>(
        defaultParadas.map((p, i) => ({ ...p, key: `existing-${i}` }))
    )

    const [capturando, setCapturando] = useState(false)
    const [nuevaParada, setNuevaParada] = useState({ ...PARADA_VACIA })

    function iniciarCaptura() {
        setNuevaParada({ ...PARADA_VACIA })
        setCapturando(true)
    }

    function confirmarParada() {
        if (!nuevaParada.nombreParada.trim() || !nuevaParada.ciudad.trim()) return
        const distancia = parseFloat(nuevaParada.distanciaDesdeOrigenKm) || 0
        const espera = parseFloat(nuevaParada.tiempoEsperaMin) || 0
        const tarifa = parseFloat(nuevaParada.tarifaDesdeOrigen) || 0
        if (distancia < 0 || espera < 0 || tarifa < 0) return
        setParadas(prev => [
            ...prev,
            {
                key: `new-${Date.now()}`,
                nombreParada: nuevaParada.nombreParada.trim(),
                ciudad: nuevaParada.ciudad.trim(),
                distanciaDesdeOrigenKm: distancia,
                tiempoEsperaMin: espera,
                tarifaDesdeOrigen: tarifa,
            },
        ])
        setCapturando(false)
        setNuevaParada({ ...PARADA_VACIA })
    }

    function eliminarParada(key: string) {
        setParadas(prev => prev.filter(p => p.key !== key))
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const form = e.currentTarget
        const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value ?? ''

        const data: RutaFormData = {
            codigoRuta: get('codigoRuta'),
            tipoRuta,
            tarifaBase: parseFloat(get('tarifaBase')) || 0,
            ciudadOrigen: get('ciudadOrigen'),
            terminalOrigen: get('terminalOrigen'),
            ciudadDestino: get('ciudadDestino'),
            terminalDestino: get('terminalDestino'),
            distanciaKm: parseFloat(get('distanciaKm')) || 0,
            tiempoEstimadoHrs: parseFloat(get('tiempoEstimadoHrs')) || 0,
            paradas: tipoRuta === TipoRuta.CON_PARADAS ? paradas : [],
        }

        startTransition(async () => {
            const result = await action(data)
            if (!result) return
            if ('warning' in result) {
                lastDataRef.current = data
                setWarning(result.warning)
            } else if ('error' in result) {
                setError(result.error)
            }
        })
    }

    function confirmarDuplicado() {
        if (!lastDataRef.current) return
        setWarning(null)
        startTransition(async () => {
            const result = await action({ ...lastDataRef.current!, omitirDuplicado: true })
            if (result && 'error' in result) setError(result.error)
        })
    }

    return (
        <form onSubmit={handleSubmit}>

            <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px]" />
            </div>

            <div className="space-y-8">

                {error && (
                    <div
                        data-testid="ruta-form-error"
                        role="alert"
                        className="flex items-center gap-3 px-5 py-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium"
                    >
                        <span className="material-symbols-outlined shrink-0">error</span>
                        {error}
                    </div>
                )}

                {warning && (
                    <div
                        data-testid="ruta-form-warning"
                        role="alert"
                        className="flex items-start gap-3 px-5 py-4 bg-tertiary-container text-on-tertiary-container rounded-xl text-sm"
                    >
                        <span className="material-symbols-outlined shrink-0 mt-0.5">warning</span>
                        <div className="flex-1">
                            <p className="font-semibold mb-3">{warning}</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={confirmarDuplicado}
                                    disabled={isPending}
                                    className="px-4 py-1.5 bg-on-tertiary-container text-tertiary-container rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
                                >
                                    Guardar de todas formas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWarning(null)}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-tertiary-container/50 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">route</span>
                        </div>
                        <h2 className="text-xl font-bold font-headline">Datos Generales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Código de Ruta <span className="text-error">*</span>
                            </label>
                            <input
                                name="codigoRuta"
                                defaultValue={defaultValues.codigoRuta}
                                placeholder="Ej: RUT-001"
                                required
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all placeholder:text-outline-variant uppercase text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Tipo de Servicio <span className="text-error">*</span>
                            </label>
                            <select
                                name="tipoRuta"
                                value={tipoRuta}
                                onChange={e => setTipoRuta(e.target.value as TipoRuta)}
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all text-sm"
                            >
                                <option value="DIRECTA">DIRECTA</option>
                                <option value="CON_PARADAS">CON ESCALA</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant ml-1">
                                Tarifa Base ($) <span className="text-error">*</span>
                            </label>
                            <input
                                name="tarifaBase"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={defaultValues.tarifaBase}
                                placeholder="0.00"
                                required
                                className="w-full bg-surface-container-low border-0 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-on-surface transition-all text-sm"
                            />
                        </div>

                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                            <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary/40">
                                <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    ORIGEN
                                </h3>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                            Ciudad Origen <span className="text-error">*</span>
                                        </label>
                                        <CityInput
                                            name="ciudadOrigen"
                                            defaultValue={defaultValues.ciudadOrigen}
                                            placeholder="Ciudad de México"
                                            required
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                            Terminal Origen <span className="text-error">*</span>
                                        </label>
                                        <input
                                            name="terminalOrigen"
                                            defaultValue={defaultValues.terminalOrigen}
                                            placeholder="Central del Norte"
                                            required
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary/40">
                                <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">flag</span>
                                    DESTINO
                                </h3>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                            Ciudad Destino <span className="text-error">*</span>
                                        </label>
                                        <CityInput
                                            name="ciudadDestino"
                                            defaultValue={defaultValues.ciudadDestino}
                                            placeholder="Guadalajara"
                                            required
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                                            Terminal Destino <span className="text-error">*</span>
                                        </label>
                                        <input
                                            name="terminalDestino"
                                            defaultValue={defaultValues.terminalDestino}
                                            placeholder="Nueva Central Camionera"
                                            required
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                            <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <span className="material-symbols-outlined">distance</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">
                                        Distancia Total
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="distanciaKm"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            defaultValue={defaultValues.distanciaKm ?? 0}
                                            className="w-24 bg-transparent border-0 text-2xl font-bold p-0 focus:ring-0 text-on-surface"
                                        />
                                        <span className="text-lg font-medium text-secondary">km</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-xl">
                                <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">
                                        Tiempo Estimado
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            name="tiempoEstimadoHrs"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            defaultValue={defaultValues.tiempoEstimadoHrs ?? 0}
                                            className="w-24 bg-transparent border-0 text-2xl font-bold p-0 focus:ring-0 text-on-surface"
                                        />
                                        <span className="text-lg font-medium text-secondary">hrs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {tipoRuta === TipoRuta.CON_PARADAS && (
                    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.04)] overflow-hidden">

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">alt_route</span>
                                </div>
                                <h2 className="text-xl font-bold font-headline">Paradas Intermedias</h2>
                            </div>
                            {!capturando && (
                                <button
                                    type="button"
                                    onClick={iniciarCaptura}
                                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full text-sm font-bold text-primary"
                                >
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    Agregar Parada
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto -mx-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface-container-low">
                                        <th className="px-8 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Orden</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Estación / Parada</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Ciudad</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Dist. Origen (km)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest">Espera (min)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest text-right">Tarifa ($)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-widest text-center">Acc.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container-low">

                                    {paradas.map((parada, i) => (
                                        <tr key={parada.key} className="hover:bg-surface-container-low/40 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-sm font-bold">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-medium text-on-surface">{parada.nombreParada}</td>
                                            <td className="px-6 py-5 text-secondary">{parada.ciudad}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-surface-container-low rounded-full text-sm">
                                                    {parada.distanciaDesdeOrigenKm} km
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-surface-container-low rounded-full text-sm">
                                                    {parada.tiempoEsperaMin} min
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-on-surface">
                                                ${parada.tarifaDesdeOrigen.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarParada(parada.key)}
                                                    className="text-secondary hover:text-error transition-colors p-1"
                                                    title="Eliminar parada"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete_outline</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {capturando && (
                                        <tr className="bg-surface-container-low/50">
                                            <td className="px-8 py-4">
                                                <span className="w-8 h-8 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-secondary text-sm">
                                                    {String(paradas.length + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    value={nuevaParada.nombreParada}
                                                    onChange={e => setNuevaParada(p => ({ ...p, nombreParada: e.target.value }))}
                                                    placeholder="Nombre Estación"
                                                    className="w-full bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <CityInput
                                                    value={nuevaParada.ciudad}
                                                    onChange={v => setNuevaParada(p => ({ ...p, ciudad: v }))}
                                                    placeholder="Ciudad, Estado"
                                                    className="w-full bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={nuevaParada.distanciaDesdeOrigenKm}
                                                    onChange={e => setNuevaParada(p => ({ ...p, distanciaDesdeOrigenKm: e.target.value }))}
                                                    placeholder="0"
                                                    className="w-20 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={nuevaParada.tiempoEsperaMin}
                                                    onChange={e => setNuevaParada(p => ({ ...p, tiempoEsperaMin: e.target.value }))}
                                                    placeholder="0"
                                                    className="w-20 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={nuevaParada.tarifaDesdeOrigen}
                                                    onChange={e => setNuevaParada(p => ({ ...p, tarifaDesdeOrigen: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="w-24 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm text-right focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center flex items-center gap-2 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={confirmarParada}
                                                    className="text-primary hover:text-primary-container font-bold text-sm transition-colors"
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCapturando(false)}
                                                    className="text-secondary hover:text-error font-bold text-sm transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    )}

                                    {paradas.length === 0 && !capturando && (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-10 text-center text-secondary text-sm">
                                                <span className="material-symbols-outlined text-3xl block mb-2 text-outline">alt_route</span>
                                                Sin paradas — haz clic en &quot;Agregar Parada&quot; para añadir una
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 p-5 bg-surface-container-low rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5">info</span>
                            <p className="text-sm text-secondary leading-relaxed">
                                Las rutas CON ESCALA calculan disponibilidad por tramos.
                                Asegúrate de que la suma de distancias no exceda la distancia total de la ruta.
                            </p>
                        </div>
                    </section>
                )}

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/rutas')}
                        className="px-8 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all"
                    >
                        Cancelar Cambios
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-12 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isPending
                            ? 'Guardando...'
                            : modo === 'crear' ? 'Guardar y Finalizar' : 'Guardar Cambios'
                        }
                    </button>
                </div>
            </div>
        </form>
    )
}
