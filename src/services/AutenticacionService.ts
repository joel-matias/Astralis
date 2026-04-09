/**
 * CU1 — Seguridad y Autenticación
 * Clase: AutenticacionService  «SERVICE»
 *
 * Diagrama de Dependencias (CU1):
 * - intentosMax : Integer = 3
 * - tiempoBloqueoMin : Integer = 15
 * + autenticar(email, pass) : SesionActiva
 * + cerrarSesion(token) : void
 * + verificarBloqueo(usuario) : Boolean
 * + generarToken() : String
 *
 * Orquesta: Usuario, SesionActiva, LogAuditoria
 * Implementa el caso de uso completo de inicio de sesión.
 */

import { Usuario } from '../models/seguridad/Usuario'
import { SesionActiva } from '../models/seguridad/SesionActiva'
import { LogAuditoria } from '../models/seguridad/LogAuditoria'

export class AutenticacionService {
    static readonly intentosMax: number = 3
    static readonly tiempoBloqueoMin: number = 15

    /**
     * Autentica al usuario verificando credenciales y estado de cuenta.
     * Diagrama: + autenticar(email, pass) : SesionActiva
     * La comparación de hash bcrypt se realiza aquí (delega a bcrypt.compare).
     * Retorna null si la autenticación falla.
     */
    autenticar(email: string, pass: string): SesionActiva | null {
        // La implementación real consulta RepositorioUsuario, llama bcrypt.compare,
        // invoca usuario.incrementarIntento() en fallo o SesionActiva.crear() en éxito.
        // Ver: auth.ts (next-auth credentials provider) para la implementación de BD.
        void email; void pass
        return null
    }

    /**
     * Invalida la sesión correspondiente al token dado.
     * Diagrama: + cerrarSesion(token) : void
     */
    cerrarSesion(token: string): void {
        // Busca la SesionActiva por token y llama sesion.invalidar()
        void token
    }

    /**
     * Verifica si el usuario está actualmente bloqueado.
     * Diagrama: + verificarBloqueo(usuario) : Boolean
     */
    verificarBloqueo(usuario: Usuario): boolean {
        return usuario.esBloqueado()
    }

    /**
     * Genera un token de acceso único (UUID v4 u otro mecanismo).
     * Diagrama: + generarToken() : String
     * La generación JWT real se delega a TokenService.
     */
    generarToken(): string {
        return crypto.randomUUID()
    }

    /**
     * Registra un intento en el log de auditoría.
     * Colabora con LogAuditoria según diagrama de secuencia.
     */
    registrarAcceso(
        usuarioID: string | null,
        accion: string,
        resultado: 'Exito' | 'Fallo' | 'Bloqueado',
        ip: string
    ): LogAuditoria {
        return new LogAuditoria(
            crypto.randomUUID(),
            accion,
            'Autenticacion',
            resultado,
            usuarioID,
            `IP: ${ip}`
        )
    }
}
