import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function FlotaLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-12 w-44" />
            </div>

            {/* Stat cards — 4 en fila */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4">
                        <Skeleton className="h-10 w-10 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-10" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search bar */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-8">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <div className="bg-surface-container-low px-6 py-4 flex gap-4">
                    {[80, 120, 140, 60, 80, 60, 120, 80].map((w, i) => (
                        <Skeleton key={i} className="h-4" style={{ width: w }} />
                    ))}
                </div>
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="px-6 py-5 flex gap-4 border-t border-outline-variant/20 items-center">
                        <Skeleton className="h-4 w-20" />
                        <div className="space-y-1 w-28">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="space-y-1 w-32">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-4 w-8 mx-auto" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-4 w-8 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}
