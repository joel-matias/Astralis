'use client'

import { useTransition } from 'react'
import { cancelarHorario } from '../actions'

interface Props {
    horarioID: string
    variant?: 'icon' | 'full'
}

export function CancelarHorarioButton({ horarioID, variant = 'full' }: Props) {
    const [isPending, startTransition] = useTransition()

    function handleClick() {
        startTransition(() => cancelarHorario(horarioID))
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                disabled={isPending}
                title="Cancelar horario"
                className="text-secondary hover:text-error transition-colors p-1 disabled:opacity-40"
            >
                <span className="material-symbols-outlined">
                    {isPending ? 'hourglass_empty' : 'cancel'}
                </span>
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-error border border-error/30 hover:bg-error-container transition-colors text-sm font-semibold disabled:opacity-40"
        >
            <span className="material-symbols-outlined text-[18px]">
                {isPending ? 'hourglass_empty' : 'cancel'}
            </span>
            {isPending ? 'Cancelando…' : 'Cancelar horario'}
        </button>
    )
}
