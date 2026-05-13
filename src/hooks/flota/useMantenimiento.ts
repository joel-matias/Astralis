'use client'

// D1, D4 CU5 — lógica de apertura y cierre de mantenimientos extraída de UIMtto
import { useState, useTransition } from 'react'
import { registrarMantenimientoAction, cerrarMantenimientoAction } from '@/app/admin/flota/actions'

export interface MensajeFeedback {
    tipo: 'error' | 'exito'
    texto: string
}

export function useMantenimiento() {
    const [mensaje, setMensaje] = useState<MensajeFeedback | null>(null)
    const [fechaCierre, setFechaCierre] = useState('')
    const [isPending, startTransition] = useTransition()

    function abrir(autobusID: string, formData: FormData, onCambio?: () => void) {
        setMensaje(null)
        startTransition(async () => {
            const resultado = await registrarMantenimientoAction(autobusID, formData)
            if (resultado.exito) {
                setMensaje({ tipo: 'exito', texto: 'Mantenimiento registrado. Autobús en mantenimiento.' })
                onCambio?.()
            } else {
                const textos: Record<string, string> = {
                    autobus_no_disponible: 'El autobús tiene un viaje activo (D6: no puede iniciar mto).',
                    mto_ya_abierto:        'Ya existe un mantenimiento abierto para este autobús (D1).',
                    datos_incompletos:     'Faltan datos obligatorios.',
                    error_bd:              'Error al guardar. Intenta de nuevo.',
                }
                setMensaje({ tipo: 'error', texto: textos[resultado.motivo] ?? 'Error desconocido.' })
            }
        })
    }

    function cerrar(mantenimientoID: string, onCambio?: () => void) {
        if (!fechaCierre) {
            setMensaje({ tipo: 'error', texto: 'Indica la fecha de cierre.' })
            return
        }
        setMensaje(null)
        startTransition(async () => {
            const resultado = await cerrarMantenimientoAction(mantenimientoID, fechaCierre)
            if (resultado.exito) {
                setMensaje({ tipo: 'exito', texto: 'Mantenimiento cerrado. Autobús disponible nuevamente.' })
                onCambio?.()
            } else {
                setMensaje({ tipo: 'error', texto: 'Error al cerrar el mantenimiento.' })
            }
        })
    }

    return { mensaje, fechaCierre, setFechaCierre, isPending, abrir, cerrar }
}
