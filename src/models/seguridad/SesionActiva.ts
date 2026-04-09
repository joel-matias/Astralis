/**
 * CU1 — Seguridad y Autenticación
 * Clase: SesionActiva
 *
 * Responsabilidades (diagrama):
 * - Almacenar el token JWT generado al autenticar
 * - Mantener vigencia de la sesión del usuario
 * - Verificar que el token no haya expirado
 * - Invalidarse al cerrar sesión o por inactividad
 * - Registrar IP para trazabilidad de acceso
 *
 * Colabora con: Usuario, LogAuditoria
 */

export class SesionActiva {
    private sesionID: string
    private usuarioID: string
    private tokenAcceso: string
    private fechaInicio: Date
    private fechaExpiracion: Date
    private ipOrigen: string
    private activa: boolean

    constructor(
        sesionID: string,
        usuarioID: string,
        tokenAcceso: string,
        fechaExpiracion: Date,
        ipOrigen: string,
        fechaInicio: Date = new Date()
    ) {
        this.sesionID = sesionID
        this.usuarioID = usuarioID
        this.tokenAcceso = tokenAcceso
        this.fechaInicio = fechaInicio
        this.fechaExpiracion = fechaExpiracion
        this.ipOrigen = ipOrigen
        this.activa = true
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    getSesionID(): string { return this.sesionID }
    getUsuarioID(): string { return this.usuarioID }
    getTokenAcceso(): string { return this.tokenAcceso }
    getFechaInicio(): Date { return this.fechaInicio }
    getFechaExpiracion(): Date { return this.fechaExpiracion }
    getIpOrigen(): string { return this.ipOrigen }
    isActiva(): boolean { return this.activa }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Fábrica estática: crea una nueva SesionActiva para el usuario dado.
     * Diagrama: + crear(usuarioID: String) : SesionActiva
     * La duración de la sesión es 8 horas según regla de negocio (diagrama estado).
     */
    static crear(
        sesionID: string,
        usuarioID: string,
        tokenAcceso: string,
        ipOrigen: string
    ): SesionActiva {
        const DURACION_MS = 8 * 60 * 60 * 1000 // 8 horas
        const expiracion = new Date(Date.now() + DURACION_MS)
        return new SesionActiva(sesionID, usuarioID, tokenAcceso, expiracion, ipOrigen)
    }

    /**
     * Verifica si el token de acceso almacenado coincide con el proporcionado.
     * Diagrama: + validarToken(token: String) : Boolean
     */
    validarToken(token: string): boolean {
        return this.activa && this.tokenAcceso === token && !this.estaExpirada()
    }

    /**
     * Invalida la sesión (cierre de sesión o inactividad).
     * Diagrama: + invalidar() : void
     */
    invalidar(): void {
        this.activa = false
    }

    /**
     * Verifica si la sesión ha superado su fecha de expiración.
     * Diagrama: + estaExpirada() : Boolean
     */
    estaExpirada(): boolean {
        return new Date() > this.fechaExpiracion
    }

    /**
     * Renueva la sesión extendiendo su fecha de expiración otras 8 horas.
     * Diagrama: + renovar() : Boolean
     */
    renovar(): boolean {
        if (!this.activa || this.estaExpirada()) return false
        const DURACION_MS = 8 * 60 * 60 * 1000
        this.fechaExpiracion = new Date(Date.now() + DURACION_MS)
        return true
    }
}
