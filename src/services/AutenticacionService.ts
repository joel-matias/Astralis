import { SesionActiva } from '@/models/seguridad/SesionActiva'
import { ControladorAutenticacion } from '@/services/ControladorAutenticacion'
import { TokenService } from '@/services/TokenService'

// «service» del diagrama de dependencias — fachada sobre ControladorAutenticacion
// Expone la interfaz del diagrama y centraliza las constantes de negocio
export class AutenticacionService {
    static readonly intentosMax: number = 3
    static readonly tiempoBloqueoMin: number = 15   // minutos de bloqueo por intentos fallidos
    private static readonly DURACION_SESION_HRS = 8 // duración real de la sesión activa

    private controlador = new ControladorAutenticacion()
    private tokenService = new TokenService()

    // Orquesta el flujo completo; retorna SesionActiva si el login fue exitoso, null si falló
    async autenticar(email: string, pass: string, ip = '0.0.0.0'): Promise<SesionActiva | null> {
        const resultado = await this.controlador.autenticar(email, pass, ip)

        if (!resultado.exito) return null

        // Reconstruye el objeto de dominio SesionActiva con los datos retornados por el controlador
        return new SesionActiva(
            resultado.sesionID,
            resultado.usuarioID,
            resultado.sesionID,
            new Date(),
            new Date(Date.now() + AutenticacionService.DURACION_SESION_HRS * 60 * 60 * 1000),
            ip
        )
    }

    // Invalida la sesión activa asociada al token dado
    cerrarSesion(token: string): void {
        const sesion = this.tokenService.decodificarPayload(token)
        void sesion // la invalidación real en BD la maneja el evento signOut de NextAuth
    }

    // Verifica si el token sigue siendo válido (no expirado ni inválido)
    verificarBloqueo(token: string): boolean {
        return this.tokenService.validarToken(token)
    }

    // Genera un token de referencia; el JWT firmado lo produce TokenService
    generarToken(usuarioID: string): string {
        return this.tokenService.generarJWT(usuarioID)
    }
}
