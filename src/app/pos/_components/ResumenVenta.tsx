'use client'

import type { DatosVenta } from './VentaWizard'
import type { EstadoVenta } from '../../../models/boletos/EstadoVenta'

interface Props {
    datos: DatosVenta
    estado: EstadoVenta
    onConfirmarPago: () => void
}

export default function ResumenVenta({ datos, estado, onConfirmarPago }: Props) {
    const { viaje, asientos, metodoPago } = datos
    const subtotal = viaje ? viaje.precio * asientos.length : 0
    const enPago = estado === 'ProcesandoPago' || estado === 'PagoRechazado'

    return (
        <aside className="w-80 shrink-0 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col shadow-[0_0_40px_rgba(20,27,44,0.04)] sticky top-24">
            <div className="px-5 py-4 border-b border-outline-variant">
                <h2 className="font-headline font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    Resumen de venta
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

                {/* Viaje seleccionado */}
                {viaje ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-xs text-secondary font-medium uppercase tracking-wide">Viaje</p>
                                <p className="font-bold text-on-surface text-base">{viaje.origen}</p>
                                <div className="flex items-center gap-1 text-secondary text-sm">
                                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                    {viaje.destino}
                                </div>
                            </div>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
                                {viaje.hora}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/10 text-xs text-secondary">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {viaje.fecha}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">star</span>
                                {viaje.tipoServicio}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-container rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-3xl text-outline block mb-1">directions_bus</span>
                        <p className="text-secondary text-sm">Sin viaje seleccionado</p>
                    </div>
                )}

                {/* Asientos */}
                {asientos.length > 0 && (
                    <div>
                        <p className="text-xs text-secondary font-medium uppercase tracking-wide mb-2">Asientos</p>
                        <div className="flex flex-wrap gap-2">
                            {asientos.map(a => (
                                <span key={a} className="bg-primary text-on-primary text-sm font-bold px-3 py-1 rounded-lg">
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Método de pago */}
                {metodoPago && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-base">
                            {metodoPago === 'TPV' ? 'credit_card' : 'payments'}
                        </span>
                        <span className="text-on-surface font-medium">
                            {metodoPago === 'TPV' ? 'Tarjeta (TPV)' : 'Efectivo'}
                        </span>
                    </div>
                )}

                {/* Sin datos */}
                {!viaje && asientos.length === 0 && (
                    <p className="text-secondary text-xs text-center mt-4">
                        Los detalles aparecerán aquí conforme avances.
                    </p>
                )}
            </div>

            {/* Desglose de precios */}
            {viaje && (
                <div className="px-5 py-4 border-t border-outline-variant bg-surface-container-low">
                    <div className="flex justify-between text-sm text-secondary mb-2">
                        <span>{asientos.length} boleto{asientos.length !== 1 ? 's' : ''} × ${viaje.precio.toFixed(2)}</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-on-surface text-lg border-t border-outline-variant pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-primary">${subtotal.toFixed(2)} MXN</span>
                    </div>

                    {!enPago && asientos.length > 0 && (
                        <button
                            onClick={onConfirmarPago}
                            className="w-full mt-4 bg-primary text-on-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined">payments</span>
                            Proceder al pago
                        </button>
                    )}
                </div>
            )}
        </aside>
    )
}
