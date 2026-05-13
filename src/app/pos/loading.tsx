import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function POSLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-4 w-48" />
            </div>

            <div className="flex gap-6 items-start">
                {/* Panel izquierdo */}
                <div className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                    {/* Step indicator */}
                    <div className="border-b border-outline-variant px-8 py-3 flex items-center gap-2">
                        {[96, 80, 64, 100].map((w, i) => (
                            <React.Fragment key={i}>
                                <Skeleton className="h-8 rounded-full" style={{ width: w }} />
                                {i < 3 && <Skeleton className="h-px w-8" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Search form */}
                    <div className="p-8 space-y-6">
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        </div>

                        <Skeleton className="h-11 w-36" />

                        {/* Result cards */}
                        <div className="space-y-3 pt-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-56" />
                                    </div>
                                    <div className="text-right space-y-2">
                                        <Skeleton className="h-7 w-20 ml-auto" />
                                        <Skeleton className="h-9 w-28 ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel derecho — resumen */}
                <div className="w-72 shrink-0 bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-outline-variant flex justify-between">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-11 w-full" />
                </div>
            </div>
        </div>
    )
}
