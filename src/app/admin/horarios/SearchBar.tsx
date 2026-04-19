'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
    defaultEstado: string
    defaultFrecuencia: string
    defaultQ: string
}

export function SearchBar({ defaultEstado, defaultFrecuencia, defaultQ }: Props) {
    const router = useRouter()
    const params = useSearchParams()

    const push = useCallback((key: string, value: string) => {
        const p = new URLSearchParams(params.toString())
        if (value && value !== 'all') p.set(key, value)
        else p.delete(key)
        p.delete('page')
        router.push(`/admin/horarios?${p.toString()}`)
    }, [params, router])

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                defaultValue={defaultQ}
                placeholder="Buscar por ruta, autobús o conductor..."
                onChange={e => push('q', e.target.value)}
                className="flex-1 bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
                defaultValue={defaultEstado}
                onChange={e => push('estado', e.target.value)}
                className="bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
                <option value="all">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="COMPLETADO">Completado</option>
            </select>
            <select
                defaultValue={defaultFrecuencia}
                onChange={e => push('frecuencia', e.target.value)}
                className="bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
                <option value="all">Todas las frecuencias</option>
                <option value="UNICO">Único</option>
                <option value="DIARIO">Diario</option>
                <option value="SEMANAL">Semanal</option>
            </select>
        </div>
    )
}
