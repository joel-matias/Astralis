import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { EstadoRuta } from '@prisma/client'
import { toggleEstadoRuta } from '../actions'
import { PrintFAB } from './_components/PrintFAB'

interface PageProps {
    params: Promise<{ id: string }>
}

function formatMin(min: number) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return `+${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim()
}

function formatHrs(hrs: number) {
    const h = Math.floor(hrs)
    const m = Math.round((hrs - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default async function DetalleRutaPage({ params }: PageProps) {
    const { id } = await params

    const ruta = await prisma.ruta.findUnique({
        where: { rutaID: id },
        include: {
            paradas: { orderBy: { ordenEnRuta: 'asc' } },
            creadoPor: { select: { nombreCompleto: true } },
            _count: { select: { horarios: true } },
        },
    })

    if (!ruta) notFound()

    const activa = ruta.estado === EstadoRuta.ACTIVA
    const distanciaNum = Number(ruta.distanciaKm)
    const tarifaNum = Number(ruta.tarifaBase)
    const tiempoNum = Number(ruta.tiempoEstimadoHrs)
    const costoPorKm = distanciaNum > 0 ? (tarifaNum / distanciaNum).toFixed(2) : '0.00'

    const fechaCreacion = ruta.creadoEn.toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/rutas"
                        className="p-2 bg-surface-container-low text-primary rounded-full hover:bg-surface-container-high transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                                Ruta {ruta.codigoRuta}
                            </h1>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full tracking-widest ${
                                activa
                                    ? 'bg-surface-container-high text-primary'
                                    : 'bg-surface-container-highest text-outline'
                            }`}>
                                {ruta.estado}
                            </span>
                        </div>
                        <p className="text-secondary font-medium">
                            {ruta.ciudadOrigen} → {ruta.ciudadDestino}
                            {' • '}
                            {ruta.tipoRuta === 'DIRECTA' ? 'Servicio Directo' : 'Con Paradas'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form action={toggleEstadoRuta.bind(null, ruta.rutaID, ruta.estado)}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-on-surface-variant font-semibold rounded-xl shadow-sm border border-outline-variant/20 hover:bg-surface-container-low transition-all active:scale-95 text-sm"
                        >
                            <span className="material-symbols-outlined text-xl">power_settings_new</span>
                            {activa ? 'Desactivar Ruta' : 'Activar Ruta'}
                        </button>
                    </form>

                    <Link
                        href={`/admin/rutas/${ruta.rutaID}/editar`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
                    >
                        <span className="material-symbols-outlined text-xl">edit</span>
                        Editar Ruta
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary opacity-70">General</span>
                            <span className="material-symbols-outlined text-primary-container">info</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                                <span className="text-secondary font-medium text-sm">Distancia Total</span>
                                <span className="text-on-surface font-bold">{distanciaNum} km</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                                <span className="text-secondary font-medium text-sm">Tiempo Estimado</span>
                                <span className="text-on-surface font-bold">{formatHrs(tiempoNum)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-secondary font-medium text-sm">Horarios Activos</span>
                                <span className="text-on-surface font-bold">{ruta._count.horarios} programados</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary opacity-70">Tarifas</span>
                            <span className="material-symbols-outlined text-primary-container">payments</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                                <span className="text-secondary font-medium text-sm">Tarifa Base</span>
                                <span className="text-on-surface font-bold">${tarifaNum.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                                <span className="text-secondary font-medium text-sm">Costo por km</span>
                                <span className="text-on-surface font-bold">${costoPorKm}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-secondary font-medium text-sm">Tipo de Servicio</span>
                                <span className="text-on-surface font-bold">
                                    {ruta.tipoRuta === 'DIRECTA' ? 'Directo' : 'Con Paradas'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 relative h-56 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(20,27,44,0.04)] bg-surface-container">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/10" />

                        <div className="absolute inset-0 flex items-center justify-center px-10">
                            <div className="w-full flex items-start gap-2">

                                <div className="flex flex-col items-center gap-1 shrink-0 min-w-20">
                                    <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
                                    <p className="text-xs font-bold text-primary text-center leading-tight mt-1">
                                        {ruta.ciudadOrigen}
                                    </p>
                                    <p className="text-[10px] text-secondary text-center leading-tight">
                                        {ruta.terminalOrigen}
                                    </p>
                                </div>

                                <div className="flex-1 flex items-center mt-2">
                                    <div className="flex-1 h-0.5 bg-primary/30" />
                                    {ruta.paradas.map(p => (
                                        <div key={p.paradaID} className="flex flex-col items-center shrink-0 mx-2">
                                            <div className="w-3 h-3 rounded-full border-2 border-primary/50 bg-surface-container-lowest ring-2 ring-primary/10" />
                                            <p className="text-[10px] text-secondary mt-1 max-w-14 text-center leading-tight">
                                                {p.ciudad.split(',')[0]}
                                            </p>
                                        </div>
                                    ))}
                                    {ruta.paradas.length === 0 && (
                                        <div className="flex-1 h-0.5 border-t border-dashed border-primary/20" />
                                    )}
                                    <div className="flex-1 h-0.5 bg-primary/30" />
                                </div>

                                <div className="flex flex-col items-center gap-1 shrink-0 min-w-20">
                                    <div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>flag</span>
                                    </div>
                                    <p className="text-xs font-bold text-secondary text-center leading-tight mt-1">
                                        {ruta.ciudadDestino}
                                    </p>
                                    <p className="text-[10px] text-secondary text-center leading-tight">
                                        {ruta.terminalDestino}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-3 left-4 bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                Visualización de Trayecto • {distanciaNum} km
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_0_40px_rgba(20,27,44,0.04)] border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-extrabold text-on-surface font-headline">Itinerario</h3>
                        <span className="material-symbols-outlined text-secondary">route</span>
                    </div>

                    <div className="relative">
                        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-surface-container-high" />

                        <div className="space-y-10 relative">

                            <div className="flex gap-5">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/10 z-10 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-on-surface text-sm">{ruta.ciudadOrigen}</h4>
                                    <p className="text-xs text-secondary">{ruta.terminalOrigen}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            00:00h
                                        </span>
                                        <span className="font-bold text-primary">$0.00</span>
                                    </div>
                                </div>
                            </div>

                            {ruta.paradas.map(p => (
                                <div key={p.paradaID} className="flex gap-5">
                                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center z-10 shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-on-surface text-sm">{p.nombreParada}</h4>
                                        <p className="text-xs text-secondary">{p.ciudad}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                {p.tiempoEsperaMin > 0 ? `${formatMin(p.tiempoEsperaMin)} espera` : 'Sin espera'}
                                            </span>
                                            <span className="font-bold text-on-surface-variant">
                                                ${Number(p.tarifaDesdeOrigen).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {ruta.paradas.length === 0 && (
                                <div className="flex gap-5">
                                    <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex items-center justify-center z-10 shrink-0">
                                        <span className="material-symbols-outlined text-[12px] text-outline">remove</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs text-outline italic">Sin paradas intermedias</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-5">
                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center ring-4 ring-secondary/10 z-10 shrink-0">
                                    <span className="material-symbols-outlined text-white text-[12px]">flag</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-on-surface text-sm">{ruta.ciudadDestino}</h4>
                                    <p className="text-xs text-secondary">{ruta.terminalDestino}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {formatHrs(tiempoNum)}
                                        </span>
                                        <span className="font-bold text-secondary">${tarifaNum.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-12 flex flex-col md:flex-row justify-between items-center py-8 border-t border-surface-container-high">
                <div className="flex flex-wrap items-center gap-6 text-sm text-secondary font-medium">
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Creado el: {fechaCreacion}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {ruta.creadoPor.nombreCompleto}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">tag</span>
                        {ruta.rutaID.slice(0, 8).toUpperCase()}
                    </span>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activa ? 'bg-green-500' : 'bg-outline-variant'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface/60">
                        {activa ? 'Ruta Activa' : 'Ruta Inactiva'}
                    </span>
                </div>
            </footer>

            <PrintFAB />
        </div>
    )
}
