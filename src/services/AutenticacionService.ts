import { Usuario } from '../models/seguridad/Usuario'
import { SesionActiva } from '../models/seguridad/SesionActiva'
import { LogAuditoria } from '../models/seguridad/LogAuditoria'

export class AutenticacionService {
    static readonly intentosMax: number = 3
    static readonly tiempoBloqueoMin: number = 15

    // La implementación real consulta RepositorioUsuario y llama bcrypt.compare.
    // Ver: auth.ts (next-auth credentials provider) para la implementación de BD.
    autenticar(email: string, pass: string): SesionActiva | null {
        void email; void pass
        return null
    }

    cerrarSesion(token: string): void {
        // Busca la SesionActiva por token y llama sesion.invalidar()
        void token
    }

    verificarBloqueo(usuario: Usuario): boolean {
        return usuario.esBloqueado()
    }

    // La generación JWT real se delega a TokenService
    generarToken(): string {
        return crypto.randomUUID()
    }

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
