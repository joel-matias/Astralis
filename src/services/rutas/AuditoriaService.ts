// service::auditoria — centraliza el registro de eventos del módulo de rutas
// Usa LogRepository (D9: Persistencia) en vez de acceder directamente a RepositorioRutas
import { LogRepository } from '@/repositories/rutas/LogRepository'

export class AuditoriaService {
    private logRepo = new LogRepository()

    async registrarCreacion(usuarioID: string, codigoRuta: string, fechaHora: Date): Promise<void> {
        await this.logRepo.save({ usuarioID, accion: 'CREAR_RUTA', codigoRuta, fechaHora })
    }

    async registrarEvento(usuarioID: string, accion: string, codigoRuta: string): Promise<void> {
        await this.logRepo.save({ usuarioID, accion, codigoRuta, fechaHora: new Date() })
    }

    async registrarDuplicadoDetectado(usuarioID: string, codigoRuta: string): Promise<void> {
        await this.logRepo.save({ usuarioID, accion: 'DUPLICADO_DETECTADO', codigoRuta, fechaHora: new Date() })
    }
}
