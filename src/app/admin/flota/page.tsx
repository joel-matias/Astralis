import Link from 'next/link'
import { Suspense } from 'react'
import { RepositorioAutobus } from '@/repositories/flota/RepositorioAutobus'
import { EstadoAutobus, TipoServicio } from '@prisma/client'
import { SearchBar } from './SearchBar'

const ESTADO_BADGE: Record<EstadoAutobus, { texto: string; clase: string; icono: string }> = {
    DISPONIBLE:       { texto: 'Disponible',       clase: 'bg-primary-fixed text-primary',          icono: 'check_circle' },
    ASIGNADO:         { texto: 'Asignado',          clase: 'bg-secondary-container text-secondary',  icono: 'directions_bus' },
    EN_MANTENIMIENTO: { texto: 'En Mantenimiento',  clase: 'bg-tertiary-container text-tertiary',    icono: 'build' },
    FUERA_DE_SERVICIO:{ texto: 'Fuera de Servicio', clase: 'bg-error-container text-error',          icono: 'block' },
}

const TIPO_LABEL: Record<TipoServicio, string> = {
    ECONOMICO: 'Económico',
    EJECUTIVO: 'Ejecutivo',
    LUJO: 'Primera',
}

interface PageProps {
    searchParams: Promise<{ q?: string; estado?: string; tipo?: string; page?: string }>
}

export default async function FlotaPage({ searchParams }: PageProps) {
    const { q = '', estado = 'all', tipo = 'all', page = '1' } = await searchParams
    const currentPage = Math.max(1, parseInt(page) || 1)
    const PAGE_SIZE = 10

    const repo = new RepositorioAutobus()
    const filtros = {
        q: q || undefined,
        estado: estado !== 'all' ? estado as EstadoAutobus : undefined,
        tipo: tipo !== 'all' ? tipo as TipoServicio : undefined,
    }

    const [autobuses, conteos] = await Promise.all([
        repo.findAll(filtros),
        repo.contarPorEstado(),
    ])

    const total = autobuses.length
    const paginados = autobuses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const to = Math.min(currentPage * PAGE_SIZE, total)

    const totalPorEstado = Object.fromEntries(conteos.map(c => [c.estadoOperativo, c._count.autobusID]))

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Gestión de Flota
                        </h1>
                        <span className="bg-surface-container-high text-primary font-bold px-3 py-1 rounded-full text-sm">
                            {total} unidades
                        </span>
                    </div>
                    <p className="text-secondary text-sm">
                        Administra los autobuses, estados operativos y mantenimientos.
                    </p>
                </div>
                <Link
                    href="/admin/flota/nueva"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Registrar autobús
                </Link>
            </header>

            {/* Resumen por estado — D6 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {(Object.entries(ESTADO_BADGE) as [EstadoAutobus, typeof ESTADO_BADGE[EstadoAutobus]][]).map(([estado, { texto, clase, icono }]) => (
                    <div key={estado} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_0_40px_rgba(20,27,44,0.04)] flex items-center gap-4">
                        <span className={`material-symbols-outlined text-2xl p-2 rounded-xl ${clase}`}>{icono}</span>
                        <div>
                            <p className="text-2xl font-extrabold text-on-surface">{totalPorEstado[estado] ?? 0}</p>
                            <p className="text-xs text-secondary">{texto}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* SearchBar */}
            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <Suspense fallback={<div className="h-10 bg-surface-container-high rounded-xl animate-pulse" />}>
                    <SearchBar defaultQ={q} defaultEstado={estado} defaultTipo={tipo} />
                </Suspense>
            </section>

            {/* Tabla */}
            <div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Número Eco.</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Placas / VIN</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Marca / Modelo</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Año</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-center">Cap.</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginados.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center text-secondary">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-outline">directions_bus</span>
                                    No se encontraron autobuses
                                </td>
                            </tr>
                        )}
                        {paginados.map((bus, i) => {
                            const badge = ESTADO_BADGE[bus.estadoOperativo]
                            const activo = bus.estadoOperativo === EstadoAutobus.DISPONIBLE || bus.estadoOperativo === EstadoAutobus.ASIGNADO
                            return (
                                <tr key={bus.autobusID}
                                    className={`hover:bg-surface-container-low/50 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                                    <td className={`px-6 py-5 font-mono text-sm font-semibold border-l-4 ${activo ? 'border-primary text-primary' : 'border-outline-variant text-outline'}`}>
                                        {bus.numeroEconomico}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-on-surface text-sm">{bus.placas}</span>
                                            <span className="text-xs text-secondary font-mono">{bus.vin.slice(0, 8)}…</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 ${!activo ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-on-surface">{bus.marca}</span>
                                            <span className="text-xs text-secondary">{bus.modelo}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 text-sm text-on-surface-variant ${!activo ? 'opacity-60' : ''}`}>{bus.anio}</td>
                                    <td className={`px-6 py-5 ${!activo ? 'opacity-60' : ''}`}>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
                                            {TIPO_LABEL[bus.tipoServicio]}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-5 text-center font-semibold text-on-surface ${!activo ? 'opacity-60' : ''}`}>
                                        {bus.capacidadAsientos}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${badge.clase}`}>
                                                <span className="material-symbols-outlined text-[13px]">{badge.icono}</span>
                                                {badge.texto}
                                            </span>
                                            {bus.mantenimientos.length > 0 && (
                                                <span className="text-xs text-tertiary flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">build</span>
                                                    Mto. abierto
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <Link href={`/admin/flota/${bus.autobusID}`}
                                                className="text-secondary hover:text-primary transition-colors p-1" title="Ver detalle">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <footer className="mt-8 flex items-center justify-between">
                <span className="text-sm text-secondary">
                    {total === 0 ? 'Sin resultados' : `Mostrando ${from} a ${to} de ${total} autobuses registrados`}
                </span>
                <Pagination currentPage={currentPage} totalPages={totalPages} q={q} estado={estado} tipo={tipo} />
            </footer>
        </div>
    )
}

function buildUrl(page: number, q: string, estado: string, tipo: string) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (estado !== 'all') p.set('estado', estado)
    if (tipo !== 'all') p.set('tipo', tipo)
    p.set('page', String(page))
    return `/admin/flota?${p.toString()}`
}

function Pagination({ currentPage, totalPages, q, estado, tipo }: {
    currentPage: number; totalPages: number; q: string; estado: string; tipo: string
}) {
    if (totalPages <= 1) return null
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
        <div className="flex gap-2">
            {currentPage > 1 && (
                <Link href={buildUrl(currentPage - 1, q, estado, tipo)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </Link>
            )}
            {pages.map(p => (
                <Link key={p} href={buildUrl(p, q, estado, tipo)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors text-sm ${
                        p === currentPage
                            ? 'bg-primary text-on-primary font-bold shadow-md'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                    {p}
                </Link>
            ))}
            {currentPage < totalPages && (
                <Link href={buildUrl(currentPage + 1, q, estado, tipo)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </Link>
            )}
        </div>
    )
}
