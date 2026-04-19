'use client'

// D9: Frontend UI — PanelNotificaciones
// Muestra alertas de cambios en rutas. Stub: la integración real depende de NotificacionService
// activo y de un canal push (WebSocket / SSE), pendiente para CUs posteriores.
export function PanelNotificaciones() {
    return (
        <div className="flex items-center gap-3 px-5 py-4 bg-surface-container-low rounded-xl text-sm text-secondary">
            <span className="material-symbols-outlined shrink-0">notifications</span>
            <span>Sin notificaciones pendientes.</span>
        </div>
    )
}
