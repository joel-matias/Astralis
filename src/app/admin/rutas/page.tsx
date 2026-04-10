import { prisma } from '@/lib/prisma'
import { EstadoRuta } from '@prisma/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchBar } from './SearchBar'
import { toggleEstadoRuta } from './actions'

const PAGE_SIZE = 10

interface PageProps {
    searchParams: Promise<{ q?: string; estado?: string; page?: string }>
}

export default async function RutasPage({ searchParams }: PageProps) {
    const { q = '', estado = 'all', page = '1' } = await searchParams
    const currentPage = Math.max(1, parseInt(page) || 1)

    const where = {
        ...(q && {
            OR: [
                { codigoRuta: { contains: q } },
                { ciudadOrigen: { contains: q } },
                { ciudadDestino: { contains: q } },
            ],
        }),
        ...(estado !== 'all' && { estado: estado as EstadoRuta }),
    }

    const [rutas, total] = await Promise.all([
        prisma.ruta.findMany({
            where,
            orderBy: { codigoRuta: 'asc' },
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.ruta.count({ where }),
    ])

    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const to = Math.min(currentPage * PAGE_SIZE, total)

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Gestión de Rutas
                        </h1>
                        <span className="bg-surface-container-high text-primary font-bold px-3 py-1 rounded-full text-sm">
                            {total} Total
                        </span>
                    </div>
                    <p className="text-secondary text-sm">
                        Administra los trayectos, tarifas y estados operativos de la red.
                    </p>
                </div>
                <Link
                    href="/admin/rutas/nueva"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nueva Ruta
                </Link>
            </header>

            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                {/* SearchBar usa useSearchParams() → requiere Suspense en Next.js 15+ */}
                <Suspense fallback={<div className="h-12 bg-surface-container-high rounded-xl animate-pulse" />}>
                    <SearchBar defaultQ={q} defaultEstado={estado} />
                </Suspense>
            </section>

            <div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Código</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Trayecto</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Terminales</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Logística</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-right">Tarifa Base</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rutas.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center text-secondary">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-outline">route</span>
                                    No se encontraron rutas
                                </td>
                            </tr>
                        )}

                        {rutas.map((ruta, i) => {
                            const activa = ruta.estado === EstadoRuta.ACTIVA
                            const pares = i % 2 === 1

                            return (
                                <tr
                                    key={ruta.rutaID}
                                    className={`hover:bg-surface-container-low/50 transition-colors ${pares ? 'bg-surface-container-low/30' : ''}`}
                                >
                                    <td className={`px-6 py-5 font-mono text-sm font-semibold border-l-4 ${activa ? 'border-primary text-primary' : 'border-outline-variant text-outline'}`}>
                                        {ruta.codigoRuta}
                                    </td>

                                    <td className={`px-6 py-5 ${!activa ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-on-surface">{ruta.ciudadOrigen}</span>
                                            <span className="text-xs text-secondary flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                {ruta.ciudadDestino}
                                            </span>
                                        </div>
                                    </td>

                                    <td className={`px-6 py-5 text-sm text-on-surface-variant ${!activa ? 'opacity-60' : ''}`}>
                                        {ruta.terminalOrigen} → {ruta.terminalDestino}
                                    </td>

                                    <td className={`px-6 py-5 ${!activa ? 'opacity-60' : ''}`}>
                                        {ruta.tipoRuta === 'DIRECTA' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-fixed text-primary">
                                                DIRECTA
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary-container text-secondary">
                                                CON PARADAS
                                            </span>
                                        )}
                                    </td>

                                    <td className={`px-6 py-5 ${!activa ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col text-xs gap-1">
                                            <span className="flex items-center gap-1 text-on-surface font-medium">
                                                <span className="material-symbols-outlined text-[16px]">distance</span>
                                                {Number(ruta.distanciaKm)} km
                                            </span>
                                            <span className="flex items-center gap-1 text-secondary">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                {Number(ruta.tiempoEstimadoHrs)} hrs
                                            </span>
                                        </div>
                                    </td>

                                    <td className={`px-6 py-5 text-right font-bold text-on-surface ${!activa ? 'opacity-60' : ''}`}>
                                        ${Number(ruta.tarifaBase).toFixed(2)}
                                    </td>

                                    <td className="px-6 py-5">
                                        {activa ? (
                                            <div className="flex items-center gap-2 font-bold text-xs" style={{ color: '#16a34a' }}>
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                ACTIVA
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-outline font-bold text-xs">
                                                <span className="w-2 h-2 rounded-full bg-outline-variant" />
                                                INACTIVA
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <Link
                                                href={`/admin/rutas/${ruta.rutaID}`}
                                                className="text-secondary hover:text-primary transition-colors p-1"
                                                title="Ver detalle"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                            <Link
                                                href={`/admin/rutas/${ruta.rutaID}/editar`}
                                                className="text-secondary hover:text-primary transition-colors p-1"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </Link>
                                            <form action={toggleEstadoRuta.bind(null, ruta.rutaID, ruta.estado)}>
                                                <button
                                                    type="submit"
                                                    title={activa ? 'Desactivar' : 'Activar'}
                                                    className={`p-1 transition-colors ${activa ? 'text-secondary hover:text-error' : 'text-primary hover:text-primary-container'}`}
                                                >
                                                    <span
                                                        className="material-symbols-outlined"
                                                        style={!activa ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                                    >
                                                        {activa ? 'block' : 'check_circle'}
                                                    </span>
                                                </button>
                                            </form>
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
                    {total === 0
                        ? 'Sin resultados'
                        : `Mostrando ${from} a ${to} de ${total} rutas registradas`}
                </span>
                <Pagination currentPage={currentPage} totalPages={totalPages} q={q} estado={estado} />
            </footer>
        </div>
    )
}

function buildUrl(page: number, q: string, estado: string): string {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (estado !== 'all') params.set('estado', estado)
    params.set('page', String(page))
    return `/admin/rutas?${params.toString()}`
}

function Pagination({ currentPage, totalPages, q, estado }: {
    currentPage: number
    totalPages: number
    q: string
    estado: string
}) {
    if (totalPages <= 1) return null

    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
        <div className="flex gap-2">
            {currentPage > 1 && (
                <Link
                    href={buildUrl(currentPage - 1, q, estado)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </Link>
            )}
            {pages.map(p => (
                <Link
                    key={p}
                    href={buildUrl(p, q, estado)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors text-sm ${
                        p === currentPage
                            ? 'bg-primary text-on-primary font-bold shadow-md'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                >
                    {p}
                </Link>
            ))}
            {currentPage < totalPages && (
                <Link
                    href={buildUrl(currentPage + 1, q, estado)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </Link>
            )}
        </div>
    )
}
