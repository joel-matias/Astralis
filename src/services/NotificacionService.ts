import nodemailer from 'nodemailer'

// «external» ServidorSMTP — componente externo del diagrama de componentes
// Si no hay credenciales SMTP configuradas en .env, registra en consola sin fallar
export class NotificacionService {

    private crearTransporte() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

        // Sin configuración SMTP, se usa un transporte nulo (solo consola)
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT ?? 587),
            secure: false,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        })
    }

    // Notificación genérica — usado por otros módulos (CU3, etc.)
    enviarNotificacion(dest: string, msg: string): void {
        void dest; void msg
    }

    notificarAsignacion(conductorID: string, horarioID: string): void {
        const msg = `Tienes una nueva asignación. Horario: ${horarioID}`
        this.enviarNotificacion(conductorID, msg)
    }

    // Notifica al administrador cuando una cuenta queda bloqueada (flujo E3)
    async notificarBloqueo(emailUsuario: string, intentos: number): Promise<void> {
        const adminEmail = process.env.ADMIN_EMAIL
        const transporte = this.crearTransporte()

        if (!transporte || !adminEmail) {
            // Sin SMTP configurado: solo registra en consola
            console.warn(`[NotificacionService] Cuenta bloqueada: ${emailUsuario} tras ${intentos} intentos. Configura SMTP_HOST, SMTP_USER, SMTP_PASS y ADMIN_EMAIL para recibir emails.`)
            return
        }

        await transporte.sendMail({
            from:    `"Astralis Sistema" <${process.env.SMTP_USER}>`,
            to:      adminEmail,
            subject: '[Astralis] Cuenta bloqueada por intentos fallidos',
            text: [
                `Se ha bloqueado automáticamente la cuenta: ${emailUsuario}`,
                `Motivo: ${intentos} intentos fallidos consecutivos`,
                `Bloqueo temporal de 15 minutos.`,
                `Revisa el panel de auditoría para más detalles.`,
            ].join('\n'),
        })
    }
}
