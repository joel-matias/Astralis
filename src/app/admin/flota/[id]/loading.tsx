import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function DetalleAutobusLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>

            {/* Datos del vehículo */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
                <Skeleton className="h-3 w-28 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="space-y-1.5">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid 2x2 de paneles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Historial de mantenimientos */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-container-low flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="bg-surface-container-low px-6 py-4 flex gap-6">
                    {[80, 100, 100, 140, 80].map((w, i) => (
                        <Skeleton key={i} className="h-4" style={{ width: w }} />
                    ))}
                </div>
                {[0, 1, 2].map(i => (
                    <div key={i} className="px-6 py-4 flex gap-6 border-t border-outline-variant/20">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
