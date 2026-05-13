function Skeleton({ className }: { className: string }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} />
}

export default function ConductorDetalleLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
            {/* Back + header */}
            <div className="mb-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-72" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-8 w-28 rounded-full" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>

            {/* Data cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Datos personales */}
                <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl p-6">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="space-y-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Asignación activa */}
                <div className="bg-surface-container-lowest rounded-2xl p-6">
                    <Skeleton className="h-5 w-36 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-36 mt-2" />
                    </div>
                </div>
            </div>

            {/* Estado + baja cards */}
            {[0, 1].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 mb-6">
                    <Skeleton className="h-5 w-36 mb-4" />
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-44" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            ))}

            {/* Historial */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
                <Skeleton className="h-5 w-48 mb-4" />
                {[0, 1, 2].map(i => (
                    <div key={i} className="flex gap-6 py-3 border-t border-outline-variant/20">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
