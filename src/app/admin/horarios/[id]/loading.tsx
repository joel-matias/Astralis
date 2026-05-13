import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function HorarioDetalleLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-4xl mx-auto">
            {/* Breadcrumb + header */}
            <div className="mb-10">
                <Skeleton className="h-4 w-40 mb-3" />
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-72" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>
            </div>

            {/* Grid 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-6">
                        <Skeleton className="h-3 w-24 mb-4" />
                        <div className="space-y-3">
                            {[0, 1, 2, 3].map(j => (
                                <div key={j} className="flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Metadata */}
            <div className="mt-6 bg-surface-container-lowest rounded-xl p-6">
                <Skeleton className="h-3 w-20 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
