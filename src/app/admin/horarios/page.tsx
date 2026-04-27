import { prisma } from '@/lib/prisma'
import { EstadoHorario, FrecuenciaHorario } from '@prisma/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchBar } from './SearchBar'
import { cancelarHorario } from './actions'

const PAGE_SIZE = 10

interface PageProps {
    searchParams: Promise<{ q?: string; estado?: string; frecuencia?: string; page?: string }>
}

const FRECUENCIA_LABEL: Record<FrecuenciaHorario, string> = {
    UNICO: 'Único',
    DIARIO: 'Diario',
    SEMANAL: 'Semanal',
}

const ESTADO_COLORS: Record<EstadoHorario, string> = {
    ACTIVO:    'bg-primary-fixed text-primary',
    CANCELADO: 'bg-error-container text-error',
    COMPLETADO:'bg-secondary-container text-secondary',
}

export default async function HorariosPage({ searchParams }: PageProps) {
    const { q = '', estado = 'all', frecuencia = 'all', page = '1' } = await searchParams
    const currentPage = Math.max(1, parseInt(page) || 1)

    const where = {
        ...(q && {
            OR: [
                { ruta: { codigoRuta: { contains: q } } },
                { ruta: { ciudadOrigen: { contains: q } } },
                { ruta: { ciudadDestino: { contains: q } } },
                { autobus: { numeroEconomico: { contains: q } } },
                { conductor: { nombreCompleto: { contains: q } } },
            ],
        }),
        ...(estado !== 'all' && { estado: estado as EstadoHorario }),
        ...(frecuencia !== 'all' && { frecuencia: frecuencia as FrecuenciaHorario }),
    }

    const [horarios, total] = await Promise.all([
        prisma.horario.findMany({
            where,
            orderBy: { fechaInicio: 'desc' },
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: {
                ruta:      { select: { codigoRuta: true, ciudadOrigen: true, ciudadDestino: true } },
                autobus:   { select: { numeroEconomico: true, tipoServicio: true } },
                conductor: { select: { nombreCompleto: true } },
            },
        }),
        prisma.horario.count({ where }),
    ])

    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const to   = Math.min(currentPage * PAGE_SIZE, total)

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                            Programación de Horarios
                        </h1>
                        <span className="bg-surface-container-high text-primary font-bold px-3 py-1 rounded-full text-sm">
                            {total} Total
                        </span>
                    </div>
                    <p className="text-secondary text-sm">
                        Gestiona los horarios de viaje, asignaciones y vigencias.
                    </p>
                </div>
                <Link
                    href="/admin/horarios/nueva"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nuevo Horario
                </Link>
            </header>

            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <Suspense fallback={<div className="h-12 bg-surface-container-high rounded-xl animate-pulse" />}>
                    <SearchBar defaultQ={q} defaultEstado={estado} defaultFrecuencia={frecuencia} />
                </Suspense>
            </section>

            <div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Ruta</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Trayecto</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Autobús</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Conductor</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Fecha inicio</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Salida</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Frecuencia</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horarios.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-6 py-20 text-center text-secondary">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-outline">calendar_month</span>
                                    No se encontraron horarios
                                </td>
                            </tr>
                        )}
                        {horarios.map((h, i) => {
                            const activo = h.estado === EstadoHorario.ACTIVO
                            const pares  = i % 2 === 1
                            return (
                                <tr
                                    key={h.horarioID}
                                    className={`hover:bg-surface-container-low/50 transition-colors ${pares ? 'bg-surface-container-low/30' : ''}`}
                                >
                                    <td className={`px-6 py-5 font-mono text-sm font-semibold border-l-4 ${activo ? 'border-primary text-primary' : 'border-outline-variant text-outline'}`}>
                                        {h.ruta.codigoRuta}
                                    </td>
                                    <td className={`px-6 py-5 ${!activo ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-on-surface text-sm">{h.ruta.ciudadOrigen}</span>
                                            <span className="text-xs text-secondary flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                {h.ruta.ciudadDestino}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 text-sm ${!activo ? 'opacity-60' : ''}`}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-on-surface">{h.autobus.numeroEconomico}</span>
                                            <span className="text-xs text-secondary capitalize">{h.autobus.tipoServicio.toLowerCase()}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 text-sm text-on-surface ${!activo ? 'opacity-60' : ''}`}>
                                        {h.conductor.nombreCompleto}
                                    </td>
                                    <td className={`px-6 py-5 text-sm text-on-surface-variant ${!activo ? 'opacity-60' : ''}`}>
                                        {h.fechaInicio.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                                    </td>
                                    <td className={`px-6 py-5 font-mono text-sm font-semibold text-on-surface ${!activo ? 'opacity-60' : ''}`}>
                                        {new Date(h.horaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
                                    </td>
                                    <td className={`px-6 py-5 ${!activo ? 'opacity-60' : ''}`}>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
                                            {FRECUENCIA_LABEL[h.frecuencia]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_COLORS[h.estado]}`}>
                                            {h.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <Link
                                                href={`/admin/horarios/${h.horarioID}`}
                                                className="text-secondary hover:text-primary transition-colors p-1"
                                                title="Ver detalle"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                            {activo && (
                                                <form action={cancelarHorario.bind(null, h.horarioID)}>
                                                    <button
                                                        type="submit"
                                                        title="Cancelar horario"
                                                        className="text-secondary hover:text-error transition-colors p-1"
                                                    >
                                                        <span className="material-symbols-outlined">cancel</span>
                                                    </button>
                                                </form>
                                            )}
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
                        : `Mostrando ${from} a ${to} de ${total} horarios registrados`}
                </span>
                <Pagination currentPage={currentPage} totalPages={totalPages} q={q} estado={estado} frecuencia={frecuencia} />
            </footer>
        </div>
    )
}

function buildUrl(page: number, q: string, estado: string, frecuencia: string) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (estado !== 'all') p.set('estado', estado)
    if (frecuencia !== 'all') p.set('frecuencia', frecuencia)
    p.set('page', String(page))
    return `/admin/horarios?${p.toString()}`
}

function Pagination({ currentPage, totalPages, q, estado, frecuencia }: {
    currentPage: number; totalPages: number; q: string; estado: string; frecuencia: string
}) {
    if (totalPages <= 1) return null
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end   = Math.min(totalPages, currentPage + delta)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
        <div className="flex gap-2">
            {currentPage > 1 && (
                <Link href={buildUrl(currentPage - 1, q, estado, frecuencia)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </Link>
            )}
            {pages.map(p => (
                <Link key={p} href={buildUrl(p, q, estado, frecuencia)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors text-sm ${
                        p === currentPage
                            ? 'bg-primary text-on-primary font-bold shadow-md'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                    {p}
                </Link>
            ))}
            {currentPage < totalPages && (
                <Link href={buildUrl(currentPage + 1, q, estado, frecuencia)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </Link>
            )}
        </div>
    )
}
