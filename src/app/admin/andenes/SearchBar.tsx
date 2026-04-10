'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { EstadoAnden } from '@prisma/client'

interface Props {
    defaultQ: string
    defaultEstado: string
}

export function SearchBar({ defaultQ, defaultEstado }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    function update(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', '1')
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}>

            {/* Buscador por número */}
            <div className="md:col-span-6 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary select-none">
                    search
                </span>
                <input
                    defaultValue={defaultQ}
                    onChange={(e) => update('q', e.target.value)}
                    placeholder="Buscar por número de andén..."
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high rounded-xl border-0 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all placeholder:text-outline text-on-surface text-sm"
                />
            </div>

            {/* Filtro de estado */}
            <div className="md:col-span-3">
                <select
                    defaultValue={defaultEstado}
                    onChange={(e) => update('estado', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-high rounded-xl border-0 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all text-on-surface text-sm"
                >
                    <option value="all">Todos los estados</option>
                    <option value={EstadoAnden.DISPONIBLE}>Disponible</option>
                    <option value={EstadoAnden.OCUPADO}>Ocupado</option>
                    <option value={EstadoAnden.RESERVADO}>Reservado</option>
                </select>
            </div>
        </div>
    )
}