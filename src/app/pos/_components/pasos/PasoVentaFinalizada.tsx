'use client'

// D6 CU4 — Estado VentaFinalizada; resumen de venta completada, inventario actualizado, email enviado
import type { DatosVenta } from '../VentaWizard'

interface Props {
    datos: DatosVenta
    onNuevaVenta: () => void
}

export default function PasoVentaFinalizada({ datos, onNuevaVenta }: Props) {
    const { viaje, asientos, cliente, boletos, transaccionId, metodoPago } = datos
    const total = viaje ? viaje.precio * asientos.length : 0

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">

            {/* Ícono de éxito */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#dcfce7' }}>
                <span className="material-symbols-outlined text-5xl" style={{ color: '#16a34a', fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                </span>
            </div>

            <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">Venta finalizada</h2>
            <p className="text-secondary mb-8 max-w-sm">
                Los boletos han sido emitidos y el comprobante fiscal generado correctamente.
                {cliente?.email && ' Se envió confirmación al cliente por email.'}
            </p>

            {/* Tarjeta de resumen */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-md text-left mb-8">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Trayecto</p>
                        <p className="font-bold text-on-surface">{viaje?.origen} → {viaje?.destino}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Fecha y hora</p>
                        <p className="font-bold text-on-surface">{viaje?.fecha} · {viaje?.hora}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Asientos</p>
                        <div className="flex gap-1 flex-wrap">
                            {asientos.sort().map(a => (
                                <span key={a} className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded">{a}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Método de pago</p>
                        <p className="font-bold text-on-surface flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                                {metodoPago === 'TPV' ? 'credit_card' : 'payments'}
                            </span>
                            {metodoPago === 'TPV' ? 'Tarjeta (TPV)' : 'Efectivo'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Transacción</p>
                        <p className="font-mono text-xs text-on-surface">{transaccionId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-secondary uppercase tracking-wide font-medium mb-0.5">Total cobrado</p>
                        <p className="font-bold text-primary text-lg">${total.toFixed(2)} MXN</p>
                    </div>
                </div>

                {cliente && (
                    <div className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-2 text-sm text-secondary">
                        <span className="material-symbols-outlined text-base">person</span>
                        <span>{cliente.nombre}</span>
                        {cliente.email && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">email</span>
                                    {cliente.email}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Estado de acciones automáticas */}
            <div className="flex gap-3 mb-8 text-xs text-secondary">
                <span className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Inventario actualizado
                </span>
                <span className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Log registrado
                </span>
                {cliente?.email && (
                    <span className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Email enviado
                    </span>
                )}
            </div>

            <button
                onClick={onNuevaVenta}
                className="bg-primary text-on-primary font-bold px-10 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-container transition-colors active:scale-95 text-base"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Nueva venta
            </button>
        </div>
    )
}
