// D7 CU6 — NegAud: Servicio Auditoría — registra todas las acciones del módulo en LogAuditoria
import { RepoAud } from '@/repositories/conductores/RepoAud'

export class NegAud {
    private repo: RepoAud

    constructor() {
        this.repo = new RepoAud()
    }

    // D2: registrar todas las acciones; almacenar fecha, hora, usuario y acción
    async registrar(datos: {
        usuarioID?: string
        accion: string
        resultado: string
        detalles?: string
    }) {
        return this.repo.save(datos)
    }
}
