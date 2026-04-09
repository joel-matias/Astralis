/**
 * CU1 — Seguridad y Autenticación
 * Clase: Usuario
 *
 * Responsabilidades (diagrama):
 * - Autenticarse con email y contraseña válidos
 * - Bloquear cuenta tras 3 intentos fallidos
 * - Conocer su rol para acceder a funciones
 * - Generar sesión activa al autenticarse
 * - Registrar cada intento en el log
 *
 * Colabora con: Rol, SesionActiva, LogAuditoria
 */

import { EstadoUsuario } from '@prisma/client'
import { Rol } from './Rol'

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

    // ── Getters ──────────────────────────────────────────────────────────────
    getUsuarioID(): string { return this.usuarioID }
    getNombreCompleto(): string { return this.nombreCompleto }
    getEmail(): string { return this.email }
    getContrasena(): string { return this.contrasena }
    getIntentosFallidos(): number { return this.intentosFallidos }
    getBloqueadoHasta(): Date | null { return this.bloqueadoHasta }
    getEstado(): EstadoUsuario { return this.estado }
    getRolID(): string { return this.rolID }
    getRol(): Rol | null { return this.rol }

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Inicia sesión verificando que la cuenta no esté bloqueada y las
     * credenciales sean válidas.
     * Diagrama: + iniciarSesion(email: String, pass: String) : Boolean
     * Nota: la comparación real del hash se realiza en AutenticacionService.
     */
    iniciarSesion(email: string, pass: string): boolean {
        if (this.esBloqueado()) return false
        return this.validarCredenciales(email, pass)
    }

    /**
     * Bloquea la cuenta durante MINUTOS_BLOQUEO minutos.
     * Diagrama: + bloquearCuenta() : void
     */
    bloquearCuenta(): void {
        this.estado = EstadoUsuario.BLOQUEADO
        this.bloqueadoHasta = new Date(
            Date.now() + Usuario.MINUTOS_BLOQUEO * 60 * 1000
        )
    }

    /**
     * Cierra la sesión del usuario y restablece el contador de intentos.
     * Diagrama: + cerrarSesion() : void
     */
    cerrarSesion(): void {
        this.intentosFallidos = 0
        // La SesionActiva correspondiente es invalidada por SesionActiva.invalidar()
    }

    /**
     * Valida que el email coincida. La verificación del hash se delega a
     * AutenticacionService usando bcrypt.compare().
     * Diagrama: + validarCredenciales(email: String, pass: String) : Boolean
     */
    validarCredenciales(email: string, pass: string): boolean {
        return this.email === email && pass.length > 0
    }

    /**
     * Incrementa el contador de intentos fallidos y bloquea si alcanza el máximo.
     * Diagrama: + incrementarIntento() : void
     */
    incrementarIntento(): void {
        this.intentosFallidos++
        if (this.intentosFallidos >= Usuario.INTENTOS_MAX) {
            this.bloquearCuenta()
        }
    }

    /**
     * Verifica si la cuenta está actualmente bloqueada, liberándola si el
     * tiempo de bloqueo ya expiró.
     * Diagrama: + esBloqueado() : Boolean
     */
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
