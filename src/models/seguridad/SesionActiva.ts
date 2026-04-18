export class SesionActiva {
    private sesionID: string
    private usuarioID: string // FK — no aparece en el diagrama de comportamiento pero es necesario para la relación con BD
    private tokenAcceso: string
    private fechaInicio: Date
    private fechaExpiracion: Date
    private ipOrigen: string

    private static readonly DURACION_HRS = 8

    constructor(
        sesionID: string,
        usuarioID: string,
        tokenAcceso: string,
        fechaInicio: Date,
        fechaExpiracion: Date,
        ipOrigen: string
    ) {
        this.sesionID = sesionID
        this.usuarioID = usuarioID
        this.tokenAcceso = tokenAcceso
        this.fechaInicio = fechaInicio
        this.fechaExpiracion = fechaExpiracion
        this.ipOrigen = ipOrigen
    }

    getSesionID(): string { return this.sesionID }
    getUsuarioID(): string { return this.usuarioID }
    getTokenAcceso(): string { return this.tokenAcceso }
    getFechaInicio(): Date { return this.fechaInicio }
    getFechaExpiracion(): Date { return this.fechaExpiracion }
    getIpOrigen(): string { return this.ipOrigen }

    // Factory del diagrama: recibe usuarioID y genera automáticamente los demás campos
    static crearUsuarioId(usuarioID: string): SesionActiva {
        const sesionID = crypto.randomUUID()
        const ahora = new Date()
        const expiracion = new Date(ahora.getTime() + SesionActiva.DURACION_HRS * 60 * 60 * 1000)
        return new SesionActiva(sesionID, usuarioID, sesionID, ahora, expiracion, '')
    }

    // Verifica que el token coincida con el almacenado y que la sesión no haya expirado
    validarToken(token: string): boolean {
        return this.tokenAcceso === token && !this.estaExpirada()
    }

    invalidar(): void {
        this.fechaExpiracion = new Date(0)
    }

    estaExpirada(): boolean {
        return new Date() > this.fechaExpiracion
    }

    // estaActiva: método del diagrama de dependencias — inverso de estaExpirada
    estaActiva(): boolean {
        return !this.estaExpirada()
    }

    // Extiende la vigencia 8 horas más si la sesión sigue activa
    renovar(): boolean {
        if (this.estaExpirada()) return false
        this.fechaExpiracion = new Date(
            Date.now() + SesionActiva.DURACION_HRS * 60 * 60 * 1000
        )
        return true
    }
}
