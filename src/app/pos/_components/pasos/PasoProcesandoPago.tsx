'use client'

// D6 CU4 — Estado ProcesandoPago; datos del cliente y método de pago (E2 pago rechazado, E3 error)
import { useState, useTransition } from 'react'
import type { DatosVenta } from '../VentaWizard'
import { procesarVentaAction } from '../../actions'

interface Props {
    datos: DatosVenta
    rechazado: boolean
    onPagoExitoso: (
        cliente: { nombre: string; email: string },
        metodoPago: 'TPV' | 'EFECTIVO',
        montoRecibido: number,
        transaccionId: string,
        boletos: { id: string; qr: string; asiento: string }[]
    ) => void
    onPagoRechazado: () => void
    onVolver: () => void
}

export default function PasoProcesandoPago({ datos, rechazado, onPagoExitoso, onPagoRechazado, onVolver }: Props) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [metodoPago, setMetodoPago] = useState<'TPV' | 'EFECTIVO'>('TPV')
    const [montoRecibido, setMontoRecibido] = useState('')
    const [procesando, setProcesando] = useState(false)

    const total = datos.viaje ? datos.viaje.precio * datos.asientos.length : 0
    const cambio = metodoPago === 'EFECTIVO' ? Math.max(0, parseFloat(montoRecibido || '0') - total) : 0
    const montoInsuficiente = metodoPago === 'EFECTIVO' && parseFloat(montoRecibido || '0') < total

    async function procesarPago(e: React.FormEvent) {
        e.preventDefault()
        if (!nombre.trim()) return
        setProcesando(true)

        // Simulación de procesamiento (stub — real en ProcesadorPago service)
        await new Promise(r => setTimeout(r, 1500))

        setProcesando(false)
        onPagoExitoso(
            { nombre, email },
            metodoPago,
            parseFloat(montoRecibido || String(total)),
            `TXN-${Date.now()}`
        )
    }

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onVolver} className="text-secondary hover:text-on-surface transition-colors p-1">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-headline font-bold text-2xl text-on-surface">Datos y pago</h2>
                    <p className="text-secondary text-sm">Ingresa los datos del pasajero principal y procesa el cobro</p>
                </div>
            </div>

            {/* Alerta pago rechazado — E2 */}
            {rechazado && (
                <div className="bg-error-container border border-error/20 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-error mt-0.5">error</span>
                    <div>
                        <p className="font-bold text-on-error-container text-sm">Pago rechazado</p>
                        <p className="text-on-error-container/80 text-xs mt-0.5">La transacción fue denegada. Intenta con otro método de pago o verifica los fondos.</p>
                    </div>
                </div>
            )}

            <form onSubmit={procesarPago} className="flex flex-col gap-5">

                {/* Datos del cliente */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
                    <h3 className="font-bold text-on-surface text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">person</span>
                        Pasajero principal
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                                Nombre completo *
                            </label>
                            <input
                                required
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                placeholder="Ej. María García López"
                                className="w-full px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="cliente@ejemplo.com"
                                className="w-full px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Método de pago */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
                    <h3 className="font-bold text-on-surface text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">payments</span>
                        Método de pago
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {(['TPV', 'EFECTIVO'] as const).map(metodo => (
                            <button
                                key={metodo}
                                type="button"
                                onClick={() => setMetodoPago(metodo)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    metodoPago === metodo
                                        ? 'border-primary bg-primary/5'
                                        : 'border-outline-variant hover:border-primary/40'
                                }`}
                            >
                                <span className={`material-symbols-outlined block mb-1 text-2xl ${metodoPago === metodo ? 'text-primary' : 'text-secondary'}`}
                                    style={metodoPago === metodo ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                    {metodo === 'TPV' ? 'credit_card' : 'payments'}
                                </span>
                                <p className={`font-bold text-sm ${metodoPago === metodo ? 'text-primary' : 'text-on-surface'}`}>
                                    {metodo === 'TPV' ? 'Tarjeta (TPV)' : 'Efectivo'}
                                </p>
                                <p className="text-xs text-secondary mt-0.5">
                                    {metodo === 'TPV' ? 'Débito o crédito' : 'Billetes y monedas'}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Calculadora de cambio para efectivo */}
                    {metodoPago === 'EFECTIVO' && (
                        <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
                                    Monto recibido
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-secondary text-sm font-bold">$</span>
                                    <input
                                        type="number"
                                        min={total}
                                        step="0.01"
                                        value={montoRecibido}
                                        onChange={e => setMontoRecibido(e.target.value)}
                                        placeholder={total.toFixed(2)}
                                        className="w-full pl-7 pr-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-secondary font-medium uppercase tracking-wide mb-1">Cambio</p>
                                <p className={`font-bold text-xl ${montoInsuficiente ? 'text-error' : 'text-on-surface'}`}>
                                    ${montoInsuficiente ? '—' : cambio.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Total + botón */}
                <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant p-5">
                    <div>
                        <p className="text-xs text-secondary font-medium uppercase tracking-wide">Total a cobrar</p>
                        <p className="font-bold text-3xl text-primary font-headline">${total.toFixed(2)} <span className="text-sm font-normal text-secondary">MXN</span></p>
                    </div>
                    <button
                        type="submit"
                        disabled={procesando || montoInsuficiente}
                        className="bg-primary text-on-primary font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-w-[160px] justify-center"
                    >
                        {procesando ? (
                            <>
                                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                                Procesando…
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">
                                    {metodoPago === 'TPV' ? 'credit_card' : 'payments'}
                                </span>
                                Cobrar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
