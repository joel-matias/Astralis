function Skeleton({ className }: { className: string }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} />
}

export default function AsignarLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_0_40px_rgba(20,27,44,0.06)]">
                {/* Buscador */}
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-10 w-full mb-4" />

                {/* Cards de viaje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="border-2 border-outline-variant rounded-xl p-4 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
