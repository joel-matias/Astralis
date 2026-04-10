import { EstadoUsuario, EstadoRuta, TipoRuta } from '@prisma/client'
import { Rol } from './Rol'
import { Ruta } from '../rutas/Ruta'
import type { RutaDTO } from '../rutas/RutaDTO'

export class Usuario {
    private usuarioID: string
    private nombreCompleto: string
    private email: string
    private contrasena: string          // almacenada como hash bcrypt
    private intentosFallidos: number
    private bloqueadoHasta: Date | null
    private estado: EstadoUsuario
    private rolID: string
    private rol: Rol | null

    static readonly INTENTOS_MAX = 3
    static readonly MINUTOS_BLOQUEO = 15

    constructor(
        usuarioID: string,
        nombreCompleto: string,
        email: string,
        contrasena: string,
        intentosFallidos: number,
        estado: EstadoUsuario,
        rolID: string,
        bloqueadoHasta: Date | null = null,
        rol: Rol | null = null
    ) {
        this.usuarioID = usuarioID
        this.nombreCompleto = nombreCompleto
        this.email = email
        this.contrasena = contrasena
        this.intentosFallidos = intentosFallidos
        this.bloqueadoHasta = bloqueadoHasta
        this.estado = estado
        this.rolID = rolID
        this.rol = rol
    }

    getUsuarioID(): string { return this.usuarioID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getEmail(): string { return this.email }
    getContrasena(): string { return this.contrasena }
    getIntentosFallidos(): number { return this.intentosFallidos }
    getBloqueadoHasta(): Date | null { return this.bloqueadoHasta }
    getEstado(): EstadoUsuario { return this.estado }
    getRolID(): string { return this.rolID }
    getRol(): Rol | null { return this.rol }

    iniciarSesion(email: string, pass: string): boolean {
        if (this.esBloqueado()) return false
        return this.validarCredenciales(email, pass)
    }

    bloquearCuenta(): void {
        this.estado = EstadoUsuario.BLOQUEADO
        this.bloqueadoHasta = new Date(
            Date.now() + Usuario.MINUTOS_BLOQUEO * 60 * 1000
        )
    }

    cerrarSesion(): void {
        this.intentosFallidos = 0
        // La SesionActiva correspondiente es invalidada por SesionActiva.invalidar()
    }

    // La verificación del hash se delega a AutenticacionService usando bcrypt.compare()
    validarCredenciales(email: string, pass: string): boolean {
        return this.email === email && pass.length > 0
    }

    incrementarIntento(): void {
        this.intentosFallidos++
        if (this.intentosFallidos >= Usuario.INTENTOS_MAX) {
            this.bloquearCuenta()
        }
    }

    crearRuta(datos: RutaDTO): Ruta {
        return new Ruta(
            '',
            datos.codigoRuta,
            datos.ciudadOrigen,
            datos.ciudadDestino,
            datos.terminalOrigen,
            datos.terminalDestino,
            datos.distanciaKm,
            datos.tiempoEstimadoHrs,
            datos.tipoRuta as TipoRuta,
            datos.tarifaBase,
            EstadoRuta.INACTIVA,
            new Date()
        )
    }

    esBloqueado(): boolean {
        if (this.estado !== EstadoUsuario.BLOQUEADO) return false

        // Si el tiempo de bloqueo ya expiró, se desbloquea automáticamente
        if (this.bloqueadoHasta && this.bloqueadoHasta < new Date()) {
            this.estado = EstadoUsuario.ACTIVO
            this.intentosFallidos = 0
            this.bloqueadoHasta = null
            return false
        }
        return true
    }
}
