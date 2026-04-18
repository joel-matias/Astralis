import { EstadoUsuario } from '@prisma/client'
import { Rol } from './Rol'

export class Usuario {
    private usuarioID: string
    private nombreCompleto: string
    private email: string
    private contrasena: string
    private intentosFallidos: number
    private estado: EstadoUsuario
    private rol: Rol | null // null si el Rol no fue cargado desde la BD

    constructor(
        usuarioID: string,
        nombreCompleto: string,
        email: string,
        contrasena: string,
        intentosFallidos: number,
        estado: EstadoUsuario,
        rol: Rol | null = null
    ) {
        this.usuarioID = usuarioID
        this.nombreCompleto = nombreCompleto
        this.email = email
        this.contrasena = contrasena
        this.intentosFallidos = intentosFallidos
        this.estado = estado
        this.rol = rol
    }

    getUsuarioID(): string { return this.usuarioID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getEmail(): string { return this.email }
    getContrasena(): string { return this.contrasena }
    getIntentosFallidos(): number { return this.intentosFallidos }
    getEstado(): EstadoUsuario { return this.estado }

    // obtenerRol: método del diagrama de comportamiento — navega hacia Rol
    obtenerRol(): Rol | null { return this.rol }

    iniciarSesion(email: string, pass: string): boolean {
        if (this.esBloqueado()) return false
        const validas = this.validarCredenciales(email, pass)
        if (!validas) this.incrementarIntento()
        return validas
    }

    // Verifica formato básico de credenciales; la comparación real del hash va en ControladorAutenticacion
    validarCredenciales(email: string, pass: string): boolean {
        return this.email === email && pass.length > 0
    }

    bloquearCuenta(): void {
        this.estado = EstadoUsuario.BLOQUEADO
    }

    // sesionID se recibe para que el servicio pueda invalidar la sesión correspondiente en BD
    cerrarSesion(sesionID: string): void {
        void sesionID // la invalidación real la hace ServicioSesion con este ID
        this.intentosFallidos = 0
    }

    esBloqueado(): boolean {
        return this.estado === EstadoUsuario.BLOQUEADO
    }

    // Acumula fallos y dispara bloquearCuenta al llegar al límite de 3 intentos
    incrementarIntento(): void {
        this.intentosFallidos++
        if (this.intentosFallidos >= 3) this.bloquearCuenta()
    }
}
