'use client'

import { useState, useTransition } from 'react'
import { CityInput } from '../CityInput'
import { validarParadaServidor } from '../../actions'

// Parada con key de React para gestión de lista
export interface ParadaWizard {
    key: string
    nombreParada: string
    ciudad: string
    ordenEnRuta: number
    distanciaDesdeOrigenKm: number
    tiempoDesdeOrigen: number
    tiempoEsperaMin: number
    tarifaDesdeOrigen: number
}

interface Props {
    paradas: ParadaWizard[]
    onFinalizar: (paradas: ParadaWizard[]) => void
    onAtras: () => void
}

const VACIA = {
    nombreParada: '',
    ciudad: '',
    distanciaDesdeOrigenKm: '',
    tiempoEsperaMin: '',
    tarifaDesdeOrigen: '',
}

export function PasoConfiguracionParadas({ paradas: paradasIniciales, onFinalizar, onAtras }: Props) {
    const [paradas, setParadas] = useState<ParadaWizard[]>(paradasIniciales)
    const [capturando, setCapturando] = useState(false)
    const [nueva, setNueva] = useState({ ...VACIA })
    const [errorParada, setErrorParada] = useState<string | null>(null)
    const [validando, startValidacion] = useTransition()

    function iniciarCaptura() {
        setNueva({ ...VACIA })
        setErrorParada(null)
        setCapturando(true)
    }

    // D7: validarParada → ControladorRutas → GestorParadas (server-side)
    function confirmarParada() {
        setErrorParada(null)

        if (!nueva.nombreParada.trim() || !nueva.ciudad.trim()) {
            setErrorParada('El nombre y la ciudad de la parada son obligatorios.')
            return
        }

        const distancia = parseFloat(nueva.distanciaDesdeOrigenKm) || 0
        const espera = parseFloat(nueva.tiempoEsperaMin) || 0
        const tarifa = parseFloat(nueva.tarifaDesdeOrigen) || 0

        if (distancia < 0 || espera < 0 || tarifa < 0) {
            setErrorParada('Los valores numéricos de la parada no pueden ser negativos.')
            return
        }

        startValidacion(async () => {
            const resultado = await validarParadaServidor(
                { nombreParada: nueva.nombreParada.trim(), ciudad: nueva.ciudad.trim(), distanciaDesdeOrigenKm: distancia, tiempoEsperaMin: espera, tarifaDesdeOrigen: tarifa },
                0,  // distanciaTotal desconocida en este paso; se omite la validación de rango
                paradas.map(p => ({ ciudad: p.ciudad }))
            )

            // E5: ErrorParadaInvalida — el servidor detectó datos inconsistentes
            if (!resultado.valida) {
                setErrorParada(resultado.errorDetalle ?? 'Parada inválida.')
                return
            }

            setParadas(prev => [
                ...prev,
                {
                    key: `parada-${Date.now()}`,
                    nombreParada: nueva.nombreParada.trim(),
                    ciudad: nueva.ciudad.trim(),
                    ordenEnRuta: prev.length + 1,
                    distanciaDesdeOrigenKm: distancia,
                    tiempoDesdeOrigen: 0,
                    tiempoEsperaMin: espera,
                    tarifaDesdeOrigen: tarifa,
                },
            ])
            setCapturando(false)
            setNueva({ ...VACIA })
        })
    }

    function eliminarParada(key: string) {
        setParadas(prev =>
            prev
                .filter(p => p.key !== key)
                .map((p, i) => ({ ...p, ordenEnRuta: i + 1 }))
        )
    }

    return (
        <div>
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

                {errorParada && (
                    <div data-testid="error-parada-invalida" role="alert"
                        className="flex items-center gap-3 px-5 py-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                        <span className="material-symbols-outlined shrink-0">error</span>
                        {errorParada}
                    </div>
                )}

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

                            {paradas.map((p, i) => (
                                <tr key={p.key} className="hover:bg-surface-container-low/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-sm font-bold">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-medium text-on-surface">{p.nombreParada}</td>
                                    <td className="px-6 py-5 text-secondary">{p.ciudad}</td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-surface-container-low rounded-full text-sm">
                                            {p.distanciaDesdeOrigenKm} km
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-surface-container-low rounded-full text-sm">
                                            {p.tiempoEsperaMin} min
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-bold text-on-surface">
                                        ${p.tarifaDesdeOrigen.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            type="button"
                                            onClick={() => eliminarParada(p.key)}
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
                                            value={nueva.nombreParada}
                                            onChange={e => setNueva(p => ({ ...p, nombreParada: e.target.value }))}
                                            placeholder="Nombre Estación"
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <CityInput
                                            value={nueva.ciudad}
                                            onChange={v => setNueva(p => ({ ...p, ciudad: v }))}
                                            placeholder="Ciudad, Estado"
                                            className="w-full bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number" min="0" step="0.1"
                                            value={nueva.distanciaDesdeOrigenKm}
                                            onChange={e => setNueva(p => ({ ...p, distanciaDesdeOrigenKm: e.target.value }))}
                                            placeholder="0"
                                            className="w-20 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number" min="0"
                                            value={nueva.tiempoEsperaMin}
                                            onChange={e => setNueva(p => ({ ...p, tiempoEsperaMin: e.target.value }))}
                                            placeholder="0"
                                            className="w-20 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number" min="0" step="0.01"
                                            value={nueva.tarifaDesdeOrigen}
                                            onChange={e => setNueva(p => ({ ...p, tarifaDesdeOrigen: e.target.value }))}
                                            placeholder="0.00"
                                            className="w-24 bg-surface-container-lowest border-0 rounded-xl px-3 py-2 text-sm text-right focus:ring-2 focus:ring-primary/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center gap-2 justify-center">
                                            <button type="button" onClick={confirmarParada} disabled={validando}
                                                className="text-primary hover:text-primary-container font-bold text-sm transition-colors disabled:opacity-50">
                                                {validando ? '...' : 'OK'}
                                            </button>
                                            <button type="button" onClick={() => { setCapturando(false); setErrorParada(null) }} disabled={validando}
                                                className="text-secondary hover:text-error font-bold text-sm transition-colors disabled:opacity-50">
                                                ✕
                                            </button>
                                        </div>
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

            <div className="flex items-center justify-between pt-6">
                <button
                    type="button"
                    onClick={onAtras}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Atrás
                </button>
                <button
                    type="button"
                    onClick={() => onFinalizar(paradas)}
                    className="flex items-center gap-2 px-10 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                >
                    Finalizar Paradas
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}
