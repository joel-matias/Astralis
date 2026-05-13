'use client'

// D6 CU5 — lógica de cambio de estado del autobús extraída de UIEstado
import { useState, useTransition } from 'react'
import { cambiarEstadoAutobusAction } from '@/app/admin/flota/actions'
import { EstadoAutobus } from '@prisma/client'

export interface MensajeFeedback {
    tipo: 'error' | 'exito'
    texto: string
}

export function useEstadoAutobus(autobusID: string) {
    const [motivo, setMotivo] = useState('')
    const [mensaje, setMensaje] = useState<MensajeFeedback | null>(null)
    const [isPending, startTransition] = useTransition()

    function cambiar(nuevoEstado: EstadoAutobus, onCambio?: () => void) {
        if (!motivo.trim()) {
            setMensaje({ tipo: 'error', texto: 'Indica el motivo del cambio de estado.' })
            return
        }
        setMensaje(null)
        startTransition(async () => {
            const resultado = await cambiarEstadoAutobusAction(autobusID, nuevoEstado, motivo)
            if (resultado.exito) {
                setMensaje({ tipo: 'exito', texto: `Estado cambiado: ${resultado.estadoAnterior} → ${resultado.estadoNuevo}` })
                setMotivo('')
                onCambio?.()
            } else {
                const textos: Record<string, string> = {
                    transicion_invalida: 'Transición no permitida según el diagrama de estados.',
                    tiene_mto_abierto:   'Existe un mantenimiento abierto. Ciérralo antes de cambiar el estado.',
                    error_bd:            'Error al guardar el cambio. Intenta de nuevo.',
                }
                setMensaje({ tipo: 'error', texto: textos[resultado.motivo] ?? 'Error desconocido.' })
            }
        })
    }

    return { motivo, setMotivo, mensaje, isPending, cambiar }
}
