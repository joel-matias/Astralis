import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function ConductoresLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-36" />
                    <Skeleton className="h-12 w-44" />
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[0, 1, 2].map(i => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4">
                        <Skeleton className="h-10 w-10 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-10" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-8">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <div className="bg-surface-container-low px-6 py-4 flex gap-6">
                    {[140, 180, 140, 100, 100, 80].map((w, i) => (
                        <Skeleton key={i} className={`h-4`} style={{ width: w }} />
                    ))}
                </div>
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="px-6 py-5 flex gap-6 border-t border-outline-variant/20">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}
