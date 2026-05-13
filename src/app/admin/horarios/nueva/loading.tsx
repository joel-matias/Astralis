import React from 'react'

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
    return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} style={style} />
}

export default function NuevoHorarioLoading() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Sección Ruta */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 space-y-4">
                <Skeleton className="h-3 w-16 mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Sección Recursos */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 space-y-4">
                <Skeleton className="h-3 w-36 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Sección Programación */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 space-y-4">
                <Skeleton className="h-3 w-28 mb-4" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Sección Precio */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mb-8 space-y-4">
                <Skeleton className="h-3 w-16 mb-4" />
                <Skeleton className="h-10 w-48" />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-44" />
            </div>
        </div>
    )
}
