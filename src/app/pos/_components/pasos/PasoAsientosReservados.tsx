'use client'

// D6 CU4 — Estado AsientosReservados; mapa visual del autobús con datos reales de BD
import { useState, useEffect, useTransition } from 'react'
import type { ViajeSeleccionado, AsientoSeleccionado } from '../VentaWizard'
import { obtenerAsientosAction } from '../../actions'
import type { AsientoData } from '@/repositories/boletos/AsientoRepository'

interface Props {
    viaje: ViajeSeleccionado
    numPasajeros: number
    asientosSeleccionados: AsientoSeleccionado[]
    onAsientosConfirmados: (asientos: AsientoSeleccionado[]) => void
    onContinuar: () => void
    onVolver: () => void
}

export default function PasoAsientosReservados({ viaje, numPasajeros, asientosSeleccionados, onAsientosConfirmados, onContinuar, onVolver }: Props) {
    const [seleccionados, setSeleccionados] = useState<AsientoSeleccionado[]>(asientosSeleccionados)
    const [asientos, setAsientos] = useState<AsientoData[]>([])
    const [cargando, setCargando] = useState(true)
    const [, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            const datos = await obtenerAsientosAction(viaje.id)
            setAsientos(datos)
            setCargando(false)
        })
    }, [viaje.id])

    const completo  = seleccionados.length === numPasajeros
    const faltantes = numPasajeros - seleccionados.length

    function toggleAsiento(asiento: AsientoData) {
        if (asiento.ocupado) return
        setSeleccionados(prev => {
            const yaSeleccionado = prev.find(a => a.asientoID === asiento.asientoID)
            if (yaSeleccionado) return prev.filter(a => a.asientoID !== asiento.asientoID)
            if (prev.length >= numPasajeros) return prev
            return [...prev, { numero: asiento.numero, asientoID: asiento.asientoID }]
        })
    }

    function confirmar() {
        onAsientosConfirmados(seleccionados)
        onContinuar()
    }

    function claseAsiento(asiento: AsientoData): string {
        if (asiento.ocupado) return 'bg-surface-container-highest text-outline cursor-not-allowed border border-outline-variant'
        if (seleccionados.find(a => a.asientoID === asiento.asientoID)) return 'bg-primary text-on-primary border-2 border-primary shadow-md scale-105'
        return 'bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary hover:bg-primary/5 cursor-pointer transition-all'
    }

    // Organiza los asientos en filas de 4 (A B | C D)
    const filas: AsientoData[][] = []
    for (let i = 0; i < asientos.length; i += 4) {
        filas.push(asientos.slice(i, i + 4))
    }

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onVolver} className="text-secondary hover:text-on-surface transition-colors p-1">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-headline font-bold text-2xl text-on-surface">Selecciona asientos</h2>
                    <p className="text-secondary text-sm">{viaje.origen} → {viaje.destino} · {viaje.hora} hrs · {viaje.fecha}</p>
                </div>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 mb-5 text-xs text-secondary">
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-surface-container-lowest border border-outline-variant inline-block" />
                    Disponible
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-primary inline-block" />
                    Seleccionado
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-surface-container-highest inline-block" />
                    Ocupado
                </span>
            </div>

            {/* Mapa del autobús */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 mb-5">
                {/* Cabina del conductor */}
                <div className="flex items-center justify-center mb-4 pb-4 border-b border-outline-variant gap-3">
                    <div className="bg-surface-container-high rounded-xl px-4 py-2 flex items-center gap-2 text-secondary text-sm">
                        <span className="material-symbols-outlined text-base">person</span>
                        Conductor
                    </div>
                    <div className="bg-surface-container rounded-xl px-3 py-2 text-secondary text-xs">
                        🚌 Frente del autobús
                    </div>
                </div>

                {cargando ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : asientos.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-4xl text-outline block mb-2">airline_seat_recline_extra</span>
                        <p className="text-secondary text-sm">No hay asientos registrados para este autobús</p>
                    </div>
                ) : (
                    <>
                        {/* Header columnas */}
                        <div className="grid grid-cols-[2rem_1fr_0.5rem_1fr] gap-1 mb-2 px-1">
                            <div />
                            <div className="grid grid-cols-2 gap-1 text-center">
                                <span className="text-xs font-bold text-secondary">A</span>
                                <span className="text-xs font-bold text-secondary">B</span>
                            </div>
                            <div />
                            <div className="grid grid-cols-2 gap-1 text-center">
                                <span className="text-xs font-bold text-secondary">C</span>
                                <span className="text-xs font-bold text-secondary">D</span>
                            </div>
                        </div>

                        {/* Filas de asientos */}
                        {filas.map((fila, idx) => (
                            <div key={idx} className="grid grid-cols-[2rem_1fr_0.5rem_1fr] gap-1 mb-1.5 items-center">
                                <span className="text-xs text-secondary text-center font-mono">{idx + 1}</span>
                                <div className="grid grid-cols-2 gap-1">
                                    {fila.slice(0, 2).map(asiento => (
                                        <button
                                            key={asiento.asientoID}
                                            onClick={() => toggleAsiento(asiento)}
                                            className={`h-9 rounded-lg text-xs font-bold transition-all ${claseAsiento(asiento)}`}
                                            disabled={asiento.ocupado}
                                        >
                                            {asiento.ocupado ? '✕' : asiento.numero}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-9 flex items-center justify-center">
                                    <span className="w-px h-full bg-outline-variant" />
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {fila.slice(2, 4).map(asiento => (
                                        <button
                                            key={asiento.asientoID}
                                            onClick={() => toggleAsiento(asiento)}
                                            className={`h-9 rounded-lg text-xs font-bold transition-all ${claseAsiento(asiento)}`}
                                            disabled={asiento.ocupado}
                                        >
                                            {asiento.ocupado ? '✕' : asiento.numero}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Contador + botón */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {Array.from({ length: numPasajeros }).map((_, i) => (
                            <span
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                    i < seleccionados.length
                                        ? 'bg-primary border-primary text-on-primary'
                                        : 'bg-surface-container border-outline-variant text-secondary'
                                }`}
                            >
                                {i < seleccionados.length ? seleccionados[i].numero : '?'}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-secondary">
                        {completo
                            ? 'Todos los asientos seleccionados'
                            : `Faltan ${faltantes} asiento${faltantes !== 1 ? 's' : ''} por seleccionar`}
                    </p>
                </div>
                <button
                    onClick={confirmar}
                    disabled={!completo}
                    className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Confirmar
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}
