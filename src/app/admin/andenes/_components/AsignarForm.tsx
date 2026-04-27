'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Horario {
    horarioID: string
    horaSalida: Date
    ruta: { nombreRuta: string; ciudadOrigen: string; ciudadDestino: string }
    autobus: { numeroEconomico: string; placas: string }
}

interface Anden {
    andenID: string
    numero: number
    capacidad: number
    estado: string
    horarioDisponible: string | null
}

interface Props {
    horarios: Horario[]
    andenes: Anden[]
    action: (horarioID: string, andenID: string) => Promise<{ error: string } | void>
}

export function AsignarForm({ horarios, andenes, action }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [paso, setPaso] = useState<1 | 2>(1)
    const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    function seleccionarHorario(h: Horario) {
        setHorarioSeleccionado(h)
        setPaso(2)
        setError(null)
    }

    function handleAsignar(andenID: string) {
        if (!horarioSeleccionado) return
        setError(null)
        startTransition(async () => {
            const result = await action(horarioSeleccionado.horarioID, andenID)
            if (result && 'error' in result) {
                setError(result.error)
                // E2: vuelve al paso 2 para reseleccionar andén
                if (result.error.includes('ya no está disponible')) setPaso(2)
            } else {
                router.push('/admin/andenes')
            }
        })
    }

    function handleCancelar() {
        setShowCancelConfirm(true)
    }

    function confirmarCancelar() {
        router.push('/admin/andenes')
    }

    return (
        <div className="space-y-8">

            {/* Error banner */}
            {error && (
                <div role="alert" className="flex items-center gap-3 px-5 py-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    <span className="material-symbols-outlined shrink-0">error</span>
                    {error}
                </div>
            )}

            {/* Indicador de pasos */}
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    paso === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary'
                }`}>
                    <span className="material-symbols-outlined text-sm">directions_bus</span>
                    Paso 1: Seleccionar autobús
                </div>
                <span className="material-symbols-outlined text-outline">arrow_forward</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    paso === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary'
                }`}>
                    <span className="material-symbols-outlined text-sm">garage</span>
                    Paso 2: Seleccionar andén
                </div>
            </div>

            {/* PASO 1 — Autobuses programados sin andén */}
            {paso === 1 && (
                <section className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] overflow-hidden">
                    <div className="px-6 py-5 bg-surface-container-low flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm">directions_bus</span>
                        </div>
                        <h2 className="text-base font-bold">Autobuses programados sin andén asignado</h2>
                    </div>

                    {horarios.length === 0 ? (
                        <div className="px-6 py-20 text-center text-secondary">
                            <span className="material-symbols-outlined text-5xl block mb-2 text-outline">directions_bus</span>
                            <p className="font-semibold">No hay autobuses pendientes de asignación</p>
                            <p className="text-sm mt-1">Todos los viajes programados ya tienen andén asignado</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-outline-variant">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Autobús</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Ruta</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Hora Salida</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horarios.map((h) => (
                                    <tr key={h.horarioID} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-on-surface">{h.autobus.numeroEconomico}</p>
                                            <p className="text-xs text-secondary">{h.autobus.placas}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-on-surface">{h.ruta.nombreRuta}</p>
                                            <p className="text-xs text-secondary">{h.ruta.ciudadOrigen} → {h.ruta.ciudadDestino}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-on-surface">
                                            {new Date(h.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => seleccionarHorario(h)}
                                                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-opacity active:scale-95"
                                            >
                                                Seleccionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            {/* PASO 2 — Andenes disponibles */}
            {paso === 2 && horarioSeleccionado && (
                <>
                    {/* Resumen del autobús seleccionado */}
                    <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">directions_bus</span>
                            </div>
                            <div>
                                <p className="text-xs text-secondary font-semibold uppercase tracking-wider">Autobús seleccionado</p>
                                <p className="text-sm font-bold text-on-surface">
                                    {horarioSeleccionado.autobus.numeroEconomico} — {horarioSeleccionado.ruta.ciudadOrigen} → {horarioSeleccionado.ruta.ciudadDestino}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setPaso(1); setHorarioSeleccionado(null) }}
                            className="text-secondary hover:text-primary transition-colors text-sm font-bold flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Cambiar
                        </button>
                    </div>

                    {/* Lista de andenes disponibles */}
                    <section className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] overflow-hidden">
                        <div className="px-6 py-5 bg-surface-container-low flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-sm">garage</span>
                            </div>
                            <h2 className="text-base font-bold">Andenes disponibles</h2>
                        </div>

                        {andenes.length === 0 ? (
                            <div className="px-6 py-20 text-center text-secondary">
                                <span className="material-symbols-outlined text-5xl block mb-2 text-outline">garage</span>
                                <p className="font-semibold">No hay andenes disponibles</p>
                                <p className="text-sm mt-1">Todos los andenes están ocupados o en mantenimiento</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-outline-variant">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Número</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Capacidad</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Horario</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {andenes.map((a) => (
                                        <tr key={a.andenID} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-on-surface">#{a.numero}</td>
                                            <td className="px-6 py-4 text-sm text-on-surface">{a.capacidad} buses</td>
                                            <td className="px-6 py-4 text-sm text-on-surface">{a.horarioDisponible || '-'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleAsignar(a.andenID)}
                                                    disabled={isPending}
                                                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60"
                                                >
                                                    {isPending ? 'Asignando...' : 'Asignar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </>
            )}

            {/* Botón cancelar + confirmación (flujo alternativo S1) */}
            {!showCancelConfirm ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleCancelar}
                        className="px-8 py-3 rounded-xl border border-outline-variant font-bold text-secondary hover:bg-surface-container-low transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-end gap-4 p-5 bg-tertiary-container text-on-tertiary-container rounded-xl">
                    <p className="text-sm font-semibold flex-1">¿Confirmas que deseas cancelar la asignación?</p>
                    <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-tertiary-container/50 transition-colors"
                    >
                        No, continuar
                    </button>
                    <button
                        onClick={confirmarCancelar}
                        className="px-4 py-2 bg-on-tertiary-container text-tertiary-container rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        Sí, cancelar
                    </button>
                </div>
            )}
        </div>
    )
}