import Link from 'next/link'

const kpis = [
    {
        label: 'Rutas totales',
        value: '148',
        icon: 'route',
        badge: '+4 este mes',
        badgeClass: 'bg-primary-fixed text-primary',
        iconClass: 'bg-primary-fixed text-primary',
    },
    {
        label: 'Rutas activas',
        value: '136',
        icon: 'check_circle',
        badge: '92%',
        badgeClass: 'bg-green-100 text-green-700',
        iconClass: 'bg-green-100 text-green-700',
    },
    {
        label: 'Viajes hoy',
        value: '47',
        icon: 'directions_bus',
        badge: 'En tránsito',
        badgeClass: 'bg-secondary-container text-secondary',
        iconClass: 'bg-secondary-container text-secondary',
    },
    {
        label: 'Pasajeros hoy',
        value: '1,284',
        icon: 'groups',
        badge: '+12%',
        badgeClass: 'bg-primary-fixed text-primary',
        iconClass: 'bg-primary-fixed text-primary',
    },
]

const rutasRecientes = [
    { codigo: 'OAX-MX01', origen: 'Oaxaca', destino: 'CDMX', tarifa: 485.0, tipo: 'DIRECTA', activa: true },
    { codigo: 'PUE-VER3', origen: 'Puebla', destino: 'Veracruz', tarifa: 260.0, tipo: 'CON PARADAS', activa: true },
    { codigo: 'GDL-MTY9', origen: 'Guadalajara', destino: 'Monterrey', tarifa: 720.0, tipo: 'DIRECTA', activa: false },
    { codigo: 'MX-QRO2', origen: 'CDMX', destino: 'Querétaro', tarifa: 340.0, tipo: 'DIRECTA', activa: true },
]

const actividad = [
    { iniciales: 'LR', nombre: 'Luis Ramírez', accion: 'activó la ruta', objeto: 'OAX-MX01', tiempo: 'hace 5 min', color: 'bg-primary-fixed text-primary' },
    { iniciales: 'AM', nombre: 'Ana Mendoza', accion: 'creó nueva ruta', objeto: 'TLC-HGO4', tiempo: 'hace 23 min', color: 'bg-green-100 text-green-700' },
    { iniciales: 'JC', nombre: 'J. Cruz', accion: 'desactivó la ruta', objeto: 'GDL-MTY9', tiempo: 'hace 1 hr', color: 'bg-red-100 text-red-700' },
    { iniciales: 'MV', nombre: 'M. Vargas', accion: 'editó tarifa en', objeto: 'PUE-VER3', tiempo: 'hace 2 hrs', color: 'bg-secondary-container text-secondary' },
]

const ocupacion = [
    { label: 'Rutas directas', pct: 87, color: 'bg-primary' },
    { label: 'Rutas con paradas', pct: 61, color: 'bg-secondary' },
    { label: 'Rutas nocturnas', pct: 73, color: 'bg-green-600' },
    { label: 'Rutas express', pct: 94, color: 'bg-amber-500' },
]

const accesosRapidos = [
    { label: 'Nueva ruta', icon: 'add_road', href: '/admin/rutas/nueva' },
    { label: 'Ver rutas', icon: 'route', href: '/admin/rutas' },
    { label: 'Reportes', icon: 'bar_chart', href: '/admin/reportes' },
    { label: 'Configuración', icon: 'settings', href: '/admin/configuracion' },
]

export default function AdminDashboard() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
                        Dashboard Administrador
                    </h1>
                    <p className="text-secondary text-sm mt-1">
                        Resumen operativo del sistema de transportes
                    </p>
                </div>
            </header>

            {/* KPIs */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_0_40px_rgba(20,27,44,0.04)] flex flex-col gap-3"
                    >
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

            {/* Ocupación */}
            <section className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
                        Ocupación por tipo de ruta
                    </h2>
                    <Link href="/admin/reportes" className="text-xs text-primary hover:underline">
                        Ver análisis completo →
                    </Link>
                </div>
                <div className="flex flex-col gap-4">
                    {ocupacion.map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-on-surface font-medium">{item.label}</span>
                                <span className="text-secondary font-bold">{item.pct}%</span>
                            </div>
                            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.color}`}
                                    style={{ width: `${item.pct}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Rutas recientes + Actividad */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

                {/* Rutas recientes */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
                            Rutas recientes
                        </h2>
                        <Link href="/admin/rutas" className="text-xs text-primary hover:underline">
                            Ver todas →
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        {rutasRecientes.map((ruta) => (
                            <div
                                key={ruta.codigo}
                                className="flex items-center gap-3 p-3 rounded-xl border border-surface-container-high bg-surface-container-low/40 hover:bg-surface-container-low transition-colors"
                            >
                                <span className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg ${ruta.activa ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-outline'}`}>
                                    {ruta.codigo}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-on-surface truncate">
                                        {ruta.origen} → {ruta.destino}
                                    </p>
                                    <p className="text-xs text-secondary">
                                        ${ruta.tarifa.toFixed(2)} · {ruta.tipo}
                                    </p>
                                </div>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ruta.activa ? 'bg-green-500 animate-pulse' : 'bg-outline-variant'}`} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actividad reciente */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-5">
                        Actividad reciente
                    </h2>
                    <div className="flex flex-col divide-y divide-surface-container-high">
                        {actividad.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${item.color}`}>
                                    {item.iniciales}
                                </span>
                                <div>
                                    <p className="text-sm text-on-surface leading-snug">
                                        <span className="font-bold">{item.nombre}</span>
                                        {' '}{item.accion}{' '}
                                        <span className="font-mono text-primary font-semibold">{item.objeto}</span>
                                    </p>
                                    <p className="text-xs text-secondary mt-0.5">{item.tiempo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Accesos rápidos */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_0_40px_rgba(20,27,44,0.04)]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-5">
                    Accesos rápidos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {accesosRapidos.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors border border-surface-container-high active:scale-95"
                        >
                            <span className="material-symbols-outlined text-primary text-[28px]">
                                {item.icon}
                            </span>
                            <span className="text-xs font-semibold text-on-surface-variant text-center">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    )
}