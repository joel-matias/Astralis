import Link from 'next/link'
import { Suspense } from 'react'
import { RepoCond } from '@/repositories/conductores/RepoCond'
import { EstadoConductor } from '@prisma/client'

// D7 CU6 — Lista de conductores con filtros y resumen por estado
const ESTADO_BADGE: Record<EstadoConductor, { texto: string; clase: string; icono: string }> = {
    ACTIVO:        { texto: 'Activo',        clase: 'bg-primary-fixed text-primary',       icono: 'check_circle' },
    NO_DISPONIBLE: { texto: 'No Disponible', clase: 'bg-secondary-container text-secondary', icono: 'pause_circle' },
    INACTIVO:      { texto: 'Inactivo',      clase: 'bg-error-container text-error',        icono: 'person_off' },
}

interface PageProps {
    searchParams: Promise<{ q?: string; estado?: string; page?: string }>
}

export default async function ConductoresPage({ searchParams }: PageProps) {
    const { q = '', estado = 'all', page = '1' } = await searchParams
    const currentPage = Math.max(1, parseInt(page) || 1)
    const PAGE_SIZE = 10

    const repo = new RepoCond()
    const [conductores, conteos] = await Promise.all([
        repo.findAll({
            q: q || undefined,
            estado: estado !== 'all' ? estado as EstadoConductor : undefined,
        }),
        repo.contarPorEstado(),
    ])

    const total = conductores.length
    const paginados = conductores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const to = Math.min(currentPage * PAGE_SIZE, total)

    const totalPorEstado = Object.fromEntries(conteos.map(c => [c.estado, c._count.conductorID]))

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Conductores
                        </h1>
                        <span className="bg-surface-container-high text-primary font-bold px-3 py-1 rounded-full text-sm">
                            {total} registros
                        </span>
                    </div>
                    <p className="text-secondary text-sm">Administra el registro, estado y asignación de conductores.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/conductores/asignar"
                        className="bg-secondary text-on-secondary px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow hover:opacity-90 transition-all active:scale-95">
                        <span className="material-symbols-outlined">assignment_ind</span>
                        Asignar a viaje
                    </Link>
                    <Link href="/admin/conductores/nueva"
                        className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95">
                        <span className="material-symbols-outlined">person_add</span>
                        Registrar conductor
                    </Link>
                </div>
            </header>

            {/* Resumen por estado — D5 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {(Object.entries(ESTADO_BADGE) as [EstadoConductor, typeof ESTADO_BADGE[EstadoConductor]][]).map(([est, { texto, clase, icono }]) => (
                    <div key={est} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_0_40px_rgba(20,27,44,0.04)] flex items-center gap-4">
                        <span className={`material-symbols-outlined text-2xl p-2 rounded-xl ${clase}`}>{icono}</span>
                        <div>
                            <p className="text-2xl font-extrabold text-on-surface">{totalPorEstado[est] ?? 0}</p>
                            <p className="text-xs text-secondary">{texto}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <Suspense>
                    <SearchBar defaultQ={q} defaultEstado={estado} />
                </Suspense>
            </section>

            {/* Tabla */}
            <div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Nombre</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">CURP</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Licencia</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Vigencia</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginados.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-secondary">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-outline">person_search</span>
                                    No se encontraron conductores
                                </td>
                            </tr>
                        )}
                        {paginados.map((c, i) => {
                            const badge = ESTADO_BADGE[c.estado]
                            const licenciaVigente = new Date(c.vigenciaLicencia) > new Date()
                            return (
                                <tr key={c.conductorID}
                                    className={`hover:bg-surface-container-low/50 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                                    <td className={`px-6 py-5 font-semibold border-l-4 ${c.estado === EstadoConductor.ACTIVO ? 'border-primary text-on-surface' : 'border-outline-variant text-outline'}`}>
                                        {c.nombreCompleto}
                                    </td>
                                    <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">{c.curp}</td>
                                    <td className="px-6 py-5 font-mono text-sm text-on-surface-variant">{c.numeroLicencia}</td>
                                    <td className="px-6 py-5 text-sm">
                                        <span className={licenciaVigente ? 'text-primary' : 'text-error'}>
                                            {new Date(c.vigenciaLicencia).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                            {!licenciaVigente && (
                                                <span className="ml-1 text-xs font-bold">(Vencida)</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${badge.clase}`}>
                                            <span className="material-symbols-outlined text-[13px]">{badge.icono}</span>
                                            {badge.texto}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <Link href={`/admin/conductores/${c.conductorID}`}
                                                className="text-secondary hover:text-primary transition-colors p-1" title="Ver detalle">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                            <Link href={`/admin/conductores/${c.conductorID}/editar`}
                                                className="text-secondary hover:text-primary transition-colors p-1" title="Editar">
                                                <span className="material-symbols-outlined">edit</span>
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
                    {total === 0 ? 'Sin resultados' : `Mostrando ${from} a ${to} de ${total} conductores`}
                </span>
                <Pagination currentPage={currentPage} totalPages={totalPages} q={q} estado={estado} />
            </footer>
        </div>
    )
}

function SearchBar({ defaultQ, defaultEstado }: { defaultQ: string; defaultEstado: string }) {
    return (
        <form className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-secondary mb-1">Buscar</label>
                <input name="q" defaultValue={defaultQ}
                    placeholder="Nombre, CURP o licencia…"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary mb-1">Estado</label>
                <select name="estado" defaultValue={defaultEstado}
                    className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="all">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="NO_DISPONIBLE">No Disponible</option>
                    <option value="INACTIVO">Inactivo</option>
                </select>
            </div>
            <button type="submit"
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Buscar
            </button>
            {(defaultQ || defaultEstado !== 'all') && (
                <a href="/admin/conductores"
                    className="px-4 py-2.5 rounded-xl text-sm text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors">
                    Limpiar
                </a>
            )}
        </form>
    )
}

function buildUrl(page: number, q: string, estado: string) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (estado !== 'all') p.set('estado', estado)
    p.set('page', String(page))
    return `/admin/conductores?${p.toString()}`
}

function Pagination({ currentPage, totalPages, q, estado }: {
    currentPage: number; totalPages: number; q: string; estado: string
}) {
    if (totalPages <= 1) return null
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
        <div className="flex gap-2">
            {currentPage > 1 && (
                <Link href={buildUrl(currentPage - 1, q, estado)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </Link>
            )}
            {pages.map(pg => (
                <Link key={pg} href={buildUrl(pg, q, estado)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors text-sm ${pg === currentPage ? 'bg-primary text-on-primary font-bold shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}>
                    {pg}
                </Link>
            ))}
            {currentPage < totalPages && (
                <Link href={buildUrl(currentPage + 1, q, estado)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </Link>
            )}
        </div>
    )
}
