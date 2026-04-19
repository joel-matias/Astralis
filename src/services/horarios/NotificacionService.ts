// D5 CU3 — Servicio de notificaciones para el módulo de horarios
// Stub — la integración real con SMTP/push se conecta cuando existan los receptores (CU3/CU6)
export class NotificacionService {

    // Envía un mensaje genérico a un destinatario
    enviarNotificacion(dest: string, msg: string): void {
        void dest
        void msg
    }

    // D7: notifica al conductor asignado; horarioID agregado al seguir el flujo del diagrama de secuencia
    notificarAsignacion(conductorID: string, horarioID: string): void {
        void conductorID
        void horarioID
    }
}
