// D9 CU3 — Fachada de persistencia del módulo; agrupa HorarioRepository y BoletoRepository
import { HorarioRepository } from './HorarioRepository'
import { BoletoRepository } from './BoletoRepository'
import type { Horario } from '@/models/horarios/Horario'
import type { Boleto } from '@/models/horarios/Boleto'

export class RepositorioHorarios {
    private horarios = new HorarioRepository()
    private boletos = new BoletoRepository()

    async save(horario: Horario, programadoPorID: string, fechaFin?: Date): Promise<string> {
        return this.horarios.save(horario, programadoPorID, fechaFin)
    }

    async cancelar(horarioID: string): Promise<void> {
        return this.horarios.cancelar(horarioID)
    }

    async guardarLog(usuarioID: string, accion: string, detalles: string): Promise<void> {
        return this.horarios.guardarLog(usuarioID, accion, detalles)
    }

    async findByRuta(rutaID: string): Promise<Horario[]> {
        return this.horarios.findByRuta(rutaID)
    }

    async findConflictos(fecha: Date, hora: Date): Promise<Horario[]> {
        return this.horarios.findConflictos(fecha, hora)
    }

    saveBoletos(boletos: Boleto[]): void {
        this.boletos.saveAll(boletos)
    }
}
