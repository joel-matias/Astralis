'use client'

import { useState, useTransition } from 'react'
import type { DatosVenta } from '@/app/pos/_components/VentaWizard'
import { procesarVentaAction } from '@/app/pos/actions'

type PagoExitosoCallback = (
    cliente: { nombre: string; email: string },
    metodoPago: 'TPV' | 'EFECTIVO',
    montoRecibido: number,
    transaccionId: string,
    boletos: { id: string; qr: string; asiento: string }[]
) => void

export function useProcesadorPago(
    datos: DatosVenta,
    onPagoExitoso: PagoExitosoCallback,
    onPagoRechazado: () => void
) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [metodoPago, setMetodoPago] = useState<'TPV' | 'EFECTIVO'>('TPV')
    const [montoRecibido, setMontoRecibido] = useState('')
    const [isPending, startTransition] = useTransition()

    const total = datos.viaje ? datos.viaje.precio * datos.asientos.length : 0
    const cambio = metodoPago === 'EFECTIVO' ? Math.max(0, parseFloat(montoRecibido || '0') - total) : 0
    const montoInsuficiente = metodoPago === 'EFECTIVO' && parseFloat(montoRecibido || '0') < total

    function procesarPago(e: React.FormEvent) {
        e.preventDefault()
        if (!nombre.trim() || !datos.viaje) return

        startTransition(async () => {
            try {
                const resultado = await procesarVentaAction({
                    horarioID: datos.viaje!.id,
                    clienteNombre: nombre.trim(),
                    clienteEmail: email.trim() || undefined,
                    asientos: datos.asientos,
                    precioUnitario: datos.viaje!.precio,
                    metodoPago,
                    montoRecibido: parseFloat(montoRecibido || String(total)),
                })
                onPagoExitoso(
                    { nombre: nombre.trim(), email: email.trim() },
                    metodoPago,
                    parseFloat(montoRecibido || String(total)),
                    resultado.transaccionId,
                    resultado.boletos
                )
            } catch {
                onPagoRechazado()
            }
        })
    }

    return {
        nombre, setNombre,
        email, setEmail,
        metodoPago, setMetodoPago,
        montoRecibido, setMontoRecibido,
        total,
        cambio,
        montoInsuficiente,
        isPending,
        procesarPago,
    }
}
