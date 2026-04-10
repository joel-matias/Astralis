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

    getSesionID(): string { return this.sesionID }
    getUsuarioID(): string { return this.usuarioID }
    getTokenAcceso(): string { return this.tokenAcceso }
    getFechaInicio(): Date { return this.fechaInicio }
    getFechaExpiracion(): Date { return this.fechaExpiracion }
    getIpOrigen(): string { return this.ipOrigen }
    isActiva(): boolean { return this.activa }

    // La duración de la sesión es 8 horas según regla de negocio
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

    validarToken(token: string): boolean {
        return this.activa && this.tokenAcceso === token && !this.estaExpirada()
    }

    invalidar(): void {
        this.activa = false
    }

    estaExpirada(): boolean {
        return new Date() > this.fechaExpiracion
    }

    renovar(): boolean {
        if (!this.activa || this.estaExpirada()) return false
        const DURACION_MS = 8 * 60 * 60 * 1000
        this.fechaExpiracion = new Date(Date.now() + DURACION_MS)
        return true
    }
}
