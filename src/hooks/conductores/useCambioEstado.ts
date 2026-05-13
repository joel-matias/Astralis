'use client'

// D7, D5 CU6 — lógica de estado para cambio de estado del conductor extraída de UIEstado
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarEstadoAction } from '@/app/admin/conductores/actions'

export function useCambioEstado(conductorID: string) {
    const router = useRouter()
    const [accion, setAccion] = useState<string | null>(null)
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [isPending, startTransition] = useTransition()

    function seleccionarAccion(nueva: string) {
        setAccion(nueva)
        setError(null)
    }

    function limpiar() {
        setAccion(null)
        setMotivo('')
        setError(null)
    }

    function confirmar() {
        if (!accion) return
        if ((accion === 'NO_DISPONIBLE' || accion === 'INACTIVO') && !motivo.trim()) {
            setError('El motivo es obligatorio')
            return
        }
        startTransition(async () => {
            const res = await cambiarEstadoAction(conductorID, accion, motivo)
            if (res.ok) {
                setExito(true)
                router.refresh()
            } else {
                setError(res.error ?? 'Error al cambiar estado')
            }
        })
    }

    return {
        accion,
        motivo,
        setMotivo,
        error,
        exito,
        isPending,
        seleccionarAccion,
        limpiar,
        confirmar,
    }
}
