'use client'

// D6 CU4 — Estado BoletoEmitido; muestra QR único y opciones de entrega al cliente
import type { DatosVenta } from '../VentaWizard'

interface Props {
    datos: DatosVenta
    onFinalizar: () => void
}

export default function PasoBoletoEmitido({ datos, onFinalizar }: Props) {
    const { viaje, asientos, boletos, cliente, metodoPago, montoRecibido } = datos
    const total = viaje ? viaje.precio * asientos.length : 0
    const cambio = metodoPago === 'EFECTIVO' ? montoRecibido - total : 0

    return (
        <div className="p-8 max-w-2xl">
            {/* Encabezado de éxito */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#dcfce7' }}>
                    <span className="material-symbols-outlined text-2xl" style={{ color: '#16a34a', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                    <h2 className="font-headline font-bold text-2xl text-on-surface">¡Pago aprobado!</h2>
                    <p className="text-secondary text-sm">
                        Transacción {datos.transaccionId} · {metodoPago === 'TPV' ? 'Tarjeta' : 'Efectivo'}
                    </p>
                </div>
            </div>

            {/* Boletos con QR */}
            <div className="flex flex-col gap-4 mb-5">
                {boletos.map((boleto) => (
                    <div key={boleto.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                        <div className="flex">
                            {/* QR simulado */}
                            <div className="bg-on-surface p-4 flex items-center justify-center w-28 shrink-0">
                                <div className="w-16 h-16 grid grid-cols-4 gap-0.5">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-surface' : 'bg-surface/20'}`} />
                                    ))}
                                </div>
                            </div>
                            {/* Detalles del boleto */}
                            <div className="flex-1 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-on-surface">{viaje?.origen} → {viaje?.destino}</p>
                                        <p className="text-xs text-secondary">{viaje?.fecha} · {viaje?.hora} hrs</p>
                                    </div>
                                    <span className="bg-primary text-on-primary text-sm font-bold px-3 py-1 rounded-lg">
                                        Asiento {boleto.asiento}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant">
                                    <div className="text-xs text-secondary font-mono">{boleto.qr}</div>
                                    <div className="font-bold text-on-surface">${viaje?.precio.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cambio en efectivo */}
            {metodoPago === 'EFECTIVO' && cambio > 0 && (
                <div className="bg-[#fefce8] border border-[#fde68a] rounded-xl p-4 mb-5 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#d97706]">payments</span>
                    <div>
                        <p className="font-bold text-[#92400e] text-sm">Entregar cambio al cliente</p>
                        <p className="text-[#92400e] text-xl font-bold">${cambio.toFixed(2)} MXN</p>
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
                <button className="flex-1 border-2 border-outline-variant text-on-surface font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined">print</span>
                    Imprimir boletos
                </button>
                {cliente?.email && (
                    <button className="flex-1 border-2 border-primary/30 text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                        <span className="material-symbols-outlined">email</span>
                        Enviar por email
                    </button>
                )}
                <button
                    onClick={onFinalizar}
                    className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined">receipt_long</span>
                    Generar comprobante
                </button>
            </div>
        </div>
    )
}
