'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { EstadoAutobus, TipoServicio } from '@prisma/client'

const ESTADOS: { valor: EstadoAutobus; etiqueta: string }[] = [
    { valor: 'DISPONIBLE',        etiqueta: 'Disponible' },
    { valor: 'ASIGNADO',          etiqueta: 'Asignado' },
    { valor: 'EN_MANTENIMIENTO',  etiqueta: 'En Mantenimiento' },
    { valor: 'FUERA_DE_SERVICIO', etiqueta: 'Fuera de Servicio' },
]

const TIPOS: { valor: TipoServicio; etiqueta: string }[] = [
    { valor: 'ECONOMICO', etiqueta: 'Económico' },
    { valor: 'EJECUTIVO', etiqueta: 'Ejecutivo' },
    { valor: 'LUJO',      etiqueta: 'Primera' },
]

interface Props { defaultQ: string; defaultEstado: string; defaultTipo: string }

export function SearchBar({ defaultQ, defaultEstado, defaultTipo }: Props) {
    const router = useRouter()
    const sp = useSearchParams()

    const navigate = useCallback((q: string, estado: string, tipo: string) => {
        const p = new URLSearchParams(sp.toString())
        if (q) p.set('q', q); else p.delete('q')
        if (estado !== 'all') p.set('estado', estado); else p.delete('estado')
        if (tipo !== 'all') p.set('tipo', tipo); else p.delete('tipo')
        p.delete('page')
        router.push(`/admin/flota?${p.toString()}`)
    }, [router, sp])

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <input
                type="text"
                defaultValue={defaultQ}
                placeholder="Buscar por número económico, placas o marca…"
                onChange={e => navigate(e.target.value, defaultEstado, defaultTipo)}
                className="flex-1 bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-secondary"
            />
            <select
                defaultValue={defaultEstado}
                onChange={e => navigate(defaultQ, e.target.value, defaultTipo)}
                className="bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
                <option value="all">Todos los estados</option>
                {ESTADOS.map(e => <option key={e.valor} value={e.valor}>{e.etiqueta}</option>)}
            </select>
            <select
                defaultValue={defaultTipo}
                onChange={e => navigate(defaultQ, defaultEstado, e.target.value)}
                className="bg-surface-container-high rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
                <option value="all">Todos los tipos</option>
                {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
            </select>
        </div>
    )
}
