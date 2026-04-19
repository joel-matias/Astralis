'use client'

// D6 CU4 — Estado BuscandoViaje; formulario de búsqueda con datos reales de BD
import { useState, useTransition } from 'react'
import type { ViajeSeleccionado } from '../VentaWizard'
import { buscarViajesAction, obtenerDestinosAction } from '../../actions'
import type { ViajeData } from '../../actions'

const SERVICIO_COLOR: Record<string, string> = {
    Ejecutivo: 'bg-primary/10 text-primary',
    Económico: 'bg-secondary-container text-secondary',
    Lujo:      'bg-[#f3e8ff] text-[#6b21a8]',
}

interface Props {
    origenes: string[]
    onViajeSeleccionado: (viaje: ViajeSeleccionado, numPasajeros: number) => void
}

export default function PasoBuscandoViaje({ origenes, onViajeSeleccionado }: Props) {
    const [origen, setOrigen]   = useState(origenes[0] ?? '')
    const [destinos, setDestinos] = useState<string[]>([])
    const [destino, setDestino] = useState('')
    const [fecha, setFecha]     = useState(() => new Date().toISOString().split('T')[0])
    const [pax, setPax]         = useState(1)
    const [viajes, setViajes]   = useState<ViajeData[]>([])
    const [buscado, setBuscado] = useState(false)

    const [isPendingDestinos, startDestinos] = useTransition()
    const [isPendingBuscar, startBuscar]     = useTransition()

    const hoy = new Date().toISOString().split('T')[0]
    const fechaValida = fecha >= hoy

    function cambiarOrigen(nuevoOrigen: string) {
        setOrigen(nuevoOrigen)
        setDestino('')
        setDestinos([])
        setBuscado(false)
        startDestinos(async () => {
            const ds = await obtenerDestinosAction(nuevoOrigen)
            setDestinos(ds)
            setDestino(ds[0] ?? '')
        })
    }

    function buscar(e: React.FormEvent) {
        e.preventDefault()
        if (!destino) return
        startBuscar(async () => {
            const resultados = await buscarViajesAction(origen, destino, fecha, pax)
            setViajes(resultados)
            setBuscado(true)
        })
    }

    // Carga los destinos del primer origen al montar
    useState(() => {
        if (origenes[0]) {
            obtenerDestinosAction(origenes[0]).then(ds => {
                setDestinos(ds)
                setDestino(ds[0] ?? '')
            })
        }
    })

    return (
        <div className="p-8 max-w-3xl">
            <div className="mb-6">
                <h2 className="font-headline font-bold text-2xl text-on-surface mb-1">Buscar viaje</h2>
                <p className="text-secondary text-sm">Ingresa los datos del trayecto para ver disponibilidad</p>
            </div>

            {/* Formulario de búsqueda */}
            <form onSubmit={buscar} className="bg-surface-container-lowest rounded-2xl shadow-[0_0_40px_rgba(20,27,44,0.06)] p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                            Origen
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">trip_origin</span>
                            <select
                                value={origen}
                                onChange={e => cambiarOrigen(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                            >
                                {origenes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                            Destino
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">place</span>
                            <select
                                value={destino}
                                onChange={e => { setDestino(e.target.value); setBuscado(false) }}
                                disabled={isPendingDestinos || destinos.length === 0}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                            >
                                {destinos.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                            Fecha de viaje
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">calendar_today</span>
                            <input
                                type="date"
                                value={fecha}
                                min={hoy}
                                onChange={e => { setFecha(e.target.value); setBuscado(false) }}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                            Pasajeros
                        </label>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => { setPax(p => Math.max(1, p - 1)); setBuscado(false) }}
                                className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors font-bold text-lg">
                                −
                            </button>
                            <span className="font-bold text-on-surface text-xl w-6 text-center">{pax}</span>
                            <button type="button" onClick={() => { setPax(p => Math.min(6, p + 1)); setBuscado(false) }}
                                className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors font-bold text-lg">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!fechaValida || !destino || isPendingBuscar}
                    className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isPendingBuscar ? (
                        <>
                            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                            Buscando…
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">search</span>
                            Buscar viajes disponibles
                        </>
                    )}
                </button>
            </form>

            {/* Resultados */}
            {buscado && (
                <div>
                    <p className="text-sm text-secondary font-medium mb-3">
                        {viajes.length > 0
                            ? `${viajes.length} viajes disponibles · ${origen} → ${destino} · ${fecha}`
                            : 'Sin resultados para los criterios ingresados'}
                    </p>

                    <div className="flex flex-col gap-3">
                        {viajes.map(viaje => (
                            <button
                                key={viaje.horarioID}
                                onClick={() => onViajeSeleccionado(
                                    {
                                        id:            viaje.horarioID,
                                        autobusID:     viaje.autobusID,
                                        origen:        viaje.origen,
                                        destino:       viaje.destino,
                                        fecha:         viaje.fecha,
                                        hora:          viaje.hora,
                                        tipoServicio:  viaje.tipoServicio,
                                        precio:        viaje.precio,
                                        asientosLibres: viaje.asientosLibres,
                                    },
                                    pax
                                )}
                                className="bg-surface-container-lowest rounded-2xl border border-outline-variant hover:border-primary hover:shadow-md transition-all p-4 text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 rounded-xl px-3 py-2 text-center min-w-[64px]">
                                            <p className="font-bold text-primary text-xl leading-tight">{viaje.hora}</p>
                                            <p className="text-xs text-primary/70">hrs</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface">{viaje.origen} → {viaje.destino}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SERVICIO_COLOR[viaje.tipoServicio] ?? 'bg-surface-container text-secondary'}`}>
                                                    {viaje.tipoServicio}
                                                </span>
                                                <span className="text-xs text-secondary flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">airline_seat_recline_extra</span>
                                                    {viaje.asientosLibres} disponibles
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-on-surface text-xl">${viaje.precio.toFixed(2)}</p>
                                        <p className="text-xs text-secondary">por persona</p>
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors mt-1">chevron_right</span>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {viajes.length === 0 && (
                            <div className="bg-surface-container rounded-2xl p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-outline block mb-2">directions_bus_filled</span>
                                <p className="text-on-surface font-medium mb-1">No hay viajes disponibles</p>
                                <p className="text-secondary text-sm">Intenta con otra fecha u otro destino</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
