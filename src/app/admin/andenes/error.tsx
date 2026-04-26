'use client'

export default function AndenesError() {
    return (
        <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">
            <div className="bg-red-50 rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-5xl block mb-2 text-red-400">
                    error
                </span>
                <p className="text-red-900 font-semibold">
                    No se pudo obtener la información de los andenes
                </p>
                <p className="text-red-700 text-sm mt-1">
                    Intente de nuevo más tarde o contacte al administrador
                </p>
            </div>
        </div>
    )
}