'use client'

export function PrintFAB() {
    return (
        <div className="fixed bottom-8 right-8">
            <button
                onClick={() => window.print()}
                className="w-14 h-14 bg-surface-container-lowest text-primary rounded-full shadow-2xl flex items-center justify-center border border-outline-variant/20 hover:scale-110 transition-transform active:scale-95"
                title="Imprimir"
            >
                <span className="material-symbols-outlined">print</span>
            </button>
        </div>
    )
}
