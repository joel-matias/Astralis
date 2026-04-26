'use server'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { EstadoAnden } from '@prisma/client'
import { Suspense } from 'react'
import { SearchBar } from './SearchBar'
import { getEtiquetaHorario, getHorarioWhere } from '@/lib/andenes/horarioUtils'

const PAGE_SIZE = 10

interface PageProps {
    searchParams: Promise<{ q: string; estado?: string; horario?: string; page?: string }>
}
export default async function AndenesPage({ searchParams }: PageProps) {
    const { q = '', estado = 'all', horario = 'all', page = '1' } = await searchParams
    const currentPage = Math.max(1, parseInt(page) || 1)

    const where = {
        ...(q && !isNaN(parseInt(q)) && { numero: parseInt(q) }),
        ...(estado !== 'all' && { estado: estado as EstadoAnden }),
        ...getHorarioWhere(horario),
    }


    const [andenes, total] = await Promise.all([
        prisma.anden.findMany({
            where,
            orderBy: { numero: 'asc' },
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: {
                asignaciones: {
                    where: { cancelada: false, estado: { in: ['RESERVADO', 'OCUPADO'] } },
                    orderBy: { fechaHora: 'desc' },
                    include: {
                        horario: {
                            select: {
                                autobus: {
                                    select: { numeroEconomico: true }
                                }
                            }
                        }
                    }
                }
            }
        }),
        prisma.anden.count({ where }),
    ])

    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const to = Math.min(currentPage * PAGE_SIZE, total)
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Gestión de Andenes
                    </h1>
                    <p className="text-secondary mt-2 text-sm">
                        mostrando anden {from} al {to} de {total} andenes
                    </p>
                </div>
                <Link
                    href="/admin/andenes/asignar"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Asignar Anden
                </Link>
                <Link
                    href="/admin/andenes/nueva"
                    className="bg-linear-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nuevo Anden
                </Link>
            </header>

            {/* SearchBar */}
            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <Suspense fallback={<div className="h-16 bg-surface-container-high rounded-xl animate-pulse"></div>}>
                    <SearchBar defaultQ={q} defaultEstado={estado} defaultHorario={horario} />
                </Suspense>
            </section>

            {/* Tabla de Andenes */}
            <div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Número</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Capacidad</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Autobuses Asignados</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Horario</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {andenes.map((anden) => (
                            <tr key={anden.andenID} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                <td className="px-6 py-4 text-sm text-on-surface font-medium">#{anden.numero}</td>
                                <td className="px-6 py-4 text-sm text-on-surface">{anden.capacidad} buses</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${anden.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                                        }`}>
                                        {anden.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface">
                                    {anden.asignaciones.length === 0
                                        ? '-'
                                        : anden.asignaciones
                                            .map(a => a.horario?.autobus?.numeroEconomico)
                                            .filter(Boolean)
                                            .join(', ')
                                    }
                                </td>
                                <td className="px-6 py-4 text-sm text-on-surface">{anden.horarioDisponible || '-'}</td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <Link href={`/admin/andenes/${anden.andenID}`} className="text-secondary hover:text-primary transition-colors p-1"
                                        title="Ver detalle">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </Link>
                                    <Link href={`/admin/andenes/${anden.andenID}/editar`} className="text-secondary hover:text-primary transition-colors p-1"
                                        title="Editar">
                                        <span className="material-symbols-outlined">edit</span></Link>
                                </td>
                            </tr>
                        ))}
                        {andenes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-secondary">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-outline">garage</span>
                                    No se encontraron andenes
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                        {currentPage > 1 && (
                            <Link
                                href={`?${new URLSearchParams({ q, estado, horario, page: (currentPage - 1).toString() }).toString()}`}
                                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-lowest transition-colors"
                            >
                                Anterior
                            </Link>
                        )}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                            return (
                                <Link
                                    key={pageNum}
                                    href={`?${new URLSearchParams({ q, estado, horario, page: pageNum.toString() }).toString()}`}
                                    className={`px-4 py-2 rounded-lg transition-colors ${pageNum === currentPage
                                        ? 'bg-primary text-on-primary'
                                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-lowest'
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            )
                        })}
                        {currentPage < totalPages && (
                            <Link
                                href={`?${new URLSearchParams({ q, estado, horario, page: (currentPage + 1).toString() }).toString()}`}
                                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-lowest transition-colors"
                            >
                                Siguiente
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}