'use client'

// D7 CU6 — lógica del flujo de baja con confirmación en dos pasos extraída de UIBaja
import { useState, useTransition } from 'react'
import { darDeBajaAction } from '@/app/admin/conductores/actions'

export function useBajaConductor(conductorID: string) {
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exito, setExito] = useState(false)
    const [confirmar, setConfirmar] = useState(false)
    const [isPending, startTransition] = useTransition()

    function solicitarBaja() {
        if (!motivo.trim()) { setError('El motivo es obligatorio'); return }
        setConfirmar(true)
    }

    function confirmarBaja() {
        startTransition(async () => {
            const res = await darDeBajaAction(conductorID, motivo)
            if (res.ok) setExito(true)
            else setError(res.error ?? 'Error al dar de baja')
        })
    }

    return {
        motivo,
        setMotivo,
        error,
        exito,
        confirmar,
        setConfirmar,
        isPending,
        solicitarBaja,
        confirmarBaja,
    }
}
