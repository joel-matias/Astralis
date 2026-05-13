import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function tiempoRelativo(fecha: Date): string {
    const diff = Date.now() - fecha.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs} hr${hrs > 1 ? 's' : ''}`
    const dias = Math.floor(hrs / 24)
    return `hace ${dias} día${dias > 1 ? 's' : ''}`
}

function moduloIcono(modulo: string): string {
    const map: Record<string, string> = {
        autenticacion: 'lock',
        rutas: 'route',
        horarios: 'calendar_month',
        flota: 'directions_bus',
        conductores: 'person',
        boletos: 'confirmation_number',
        venta: 'point_of_sale',
        pos: 'point_of_sale',
    }
    return map[modulo.toLowerCase()] ?? 'info'
}

const accesosRapidos = [
    { label: 'Nueva ruta',    icon: 'add_road',       href: '/admin/rutas/nueva' },
    { label: 'Programación',  icon: 'calendar_month', href: '/admin/horarios' },
    { label: 'Flota',         icon: 'directions_bus', href: '/admin/flota' },
    { label: 'Conductores',   icon: 'person',         href: '/admin/conductores' },
]

export default async function AdminDashboard() {
    const [
        totalRutas,
        rutasActivas,
        horariosActivos,
        autobusesTotal,
        autobusesDisponibles,
        autobusesMantenimiento,
        autobuesFueraServicio,
        conductoresTotal,
        conductoresActivos,
        conductoresNoDisponibles,
        conductoresInactivos,
        rutasRecientes,
        actividadReciente,
    ] = await Promise.all([
        prisma.ruta.count(),
        prisma.ruta.count({ where: { estado: 'ACTIVA' } }),
        prisma.horario.count({ where: { estado: 'ACTIVO' } }),
        prisma.autobus.count(),
        prisma.autobus.count({ where: { estadoOperativo: 'DISPONIBLE' } }),
        prisma.autobus.count({ where: { estadoOperativo: 'EN_MANTENIMIENTO' } }),
        prisma.autobus.count({ where: { estadoOperativo: 'FUERA_DE_SERVICIO' } }),
        prisma.conductor.count(),
        prisma.conductor.count({ where: { estado: 'ACTIVO' } }),
        prisma.conductor.count({ where: { estado: 'NO_DISPONIBLE' } }),
        prisma.conductor.count({ where: { estado: 'INACTIVO' } }),
        prisma.ruta.findMany({
            orderBy: { creadoEn: 'desc' },
            take: 4,
            select: {
                codigoRuta: true,
                ciudadOrigen: true,
                ciudadDestino: true,
                tarifaBase: true,
                tipoRuta: true,
                estado: true,
            },
        }),
        prisma.logAuditoria.findMany({
            orderBy: { fechaHora: 'desc' },
            take: 5,
            select: {
                accion: true,
                modulo: true,
                resultado: true,
                fechaHora: true,
                usuario: { select: { nombreCompleto: true } },
            },
        }),
    ])

    const kpis = [
        {
            label: 'Rutas activas',
            value: String(rutasActivas),
            icon: 'route',
            badge: `${totalRutas} total`,
            badgeClass: 'bg-surface-container-high text-secondary',
            iconClass: 'bg-primary-fixed text-primary',
        },
        {
            label: 'Horarios activos',
            value: String(horariosActivos),
            icon: 'calendar_month',
            badge: 'programados',
            badgeClass: 'bg-secondary-container text-on-secondary-container',
            iconClass: 'bg-secondary-container text-on-secondary-container',
        },
        {
            label: 'Autobuses disponibles',
            value: String(autobusesDisponibles),
            icon: 'directions_bus',
            badge: `${autobusesTotal} total`,
            badgeClass: 'bg-surface-container-high text-secondary',
            iconClass: 'bg-primary-fixed text-primary',
        },
        {
            label: 'Conductores activos',
            value: String(conductoresActivos),
            icon: 'person',
            badge: `${conductoresTotal} total`,
            badgeClass: 'bg-surface-container-high text-secondary',
            iconClass: 'bg-primary-fixed text-primary',
        },
    ]

    const estadoFlota = [
        { label: 'Disponible',        count: autobusesDisponibles,    total: autobusesTotal, color: 'bg-primary' },
        { label: 'En mantenimiento',  count: autobusesMantenimiento,  total: autobusesTotal, color: 'bg-secondary' },
        { label: 'Fuera de servicio', count: autobuesFueraServicio,   total: autobusesTotal, color: 'bg-error' },
    ]

    const estadoConductores = [
        { label: 'Activo',         count: conductoresActivos,       total: conductoresTotal, color: 'bg-primary' },
        { label: 'No disponible',  count: conductoresNoDisponibles, total: conductoresTotal, color: 'bg-secondary' },
        { label: 'Inactivo',       count: conductoresInactivos,     total: conductoresTotal, color: 'bg-outline' },
    ]

    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            <header className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                    Dashboard Administrador
                </h1>
                <p className="text-secondary text-sm mt-1">
                    Resumen operativo del sistema de transportes
                </p>
            </header>

            {/* KPIs */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {kpis.map((kpi) => (
                    <div key={kpi.label}
                        className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_0_40px_rgba(20,27,44,0.04)] flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconClass}`}>
                                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kpi.badgeClass}`}>
                                {kpi.badge}
                            </span>
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-on-surface tracking-tight">{kpi.value}</p>
                            <p className="text-xs text-secondary mt-0.5">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Estado de recursos */}
            <section className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Estado de flota</h2>
                        <Link href="/admin/flota" className="text-xs text-primary hover:underline">Ver flota →</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {estadoFlota.map(item => {
                            const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-on-surface font-medium">{item.label}</span>
                                        <span className="text-secondary">
                                            <span className="font-bold text-on-surface">{item.count}</span>
                                            {' '}({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Estado de conductores</h2>
                        <Link href="/admin/conductores" className="text-xs text-primary hover:underline">Ver conductores →</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {estadoConductores.map(item => {
                            const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-on-surface font-medium">{item.label}</span>
                                        <span className="text-secondary">
                                            <span className="font-bold text-on-surface">{item.count}</span>
                                            {' '}({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Rutas recientes + Actividad */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Rutas recientes</h2>
                        <Link href="/admin/rutas" className="text-xs text-primary hover:underline">Ver todas →</Link>
                    </div>
                    {rutasRecientes.length === 0 ? (
                        <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-outline block mb-2">route</span>
                            <p className="text-sm text-secondary">Sin rutas registradas</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {rutasRecientes.map((ruta) => (
                                <Link key={ruta.codigoRuta} href="/admin/rutas"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-surface-container-high bg-surface-container-low/40 hover:bg-surface-container-low transition-colors">
                                    <span className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg ${ruta.estado === 'ACTIVA' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-outline'}`}>
                                        {ruta.codigoRuta}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-on-surface truncate">
                                            {ruta.ciudadOrigen} → {ruta.ciudadDestino}
                                        </p>
                                        <p className="text-xs text-secondary">
                                            ${Number(ruta.tarifaBase).toFixed(2)} · {ruta.tipoRuta === 'DIRECTA' ? 'Directa' : 'Con paradas'}
                                        </p>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ruta.estado === 'ACTIVA' ? 'bg-primary' : 'bg-outline-variant'}`} />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-5">Actividad reciente</h2>
                    {actividadReciente.length === 0 ? (
                        <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-outline block mb-2">history</span>
                            <p className="text-sm text-secondary">Sin actividad registrada</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-surface-container-high">
                            {actividadReciente.map((log, i) => (
                                <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${log.resultado === 'Exito' ? 'bg-primary-fixed text-primary' : 'bg-error-container text-error'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{moduloIcono(log.modulo)}</span>
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-on-surface leading-snug">
                                            <span className="font-bold">{log.usuario?.nombreCompleto ?? 'Sistema'}</span>
                                            <span className="text-secondary"> — {log.accion}</span>
                                        </p>
                                        <p className="text-xs text-secondary mt-0.5">
                                            {log.modulo} · {tiempoRelativo(log.fechaHora)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Accesos rápidos */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-5">Accesos rápidos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {accesosRapidos.map((item) => (
                        <Link key={item.label} href={item.href}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors border border-surface-container-high active:scale-95">
                            <span className="material-symbols-outlined text-primary text-[28px]">{item.icon}</span>
                            <span className="text-xs font-semibold text-on-surface-variant text-center">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    )
}
