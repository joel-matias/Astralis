// D9 CU3 — Fachada de persistencia del módulo; agrupa HorarioRepository y BoletoRepository
import { HorarioRepository } from './HorarioRepository'
import { BoletoRepository } from './BoletoRepository'
import type { Horario } from '@/models/horarios/Horario'
import type { Boleto } from '@/models/horarios/Boleto'

export class RepositorioHorarios {
    private horarios = new HorarioRepository()
    private boletos = new BoletoRepository()

    save(horario: Horario): void {
        this.horarios.save(horario)
    }

    findByRuta(rutaID: string): Horario[] {
        return this.horarios.findByRuta(rutaID)
    }

    findConflictos(fecha: Date, hora: Date): Horario[] {
        return this.horarios.findConflictos(fecha, hora)
    }

    saveBoletos(boletos: Boleto[]): void {
        this.boletos.saveAll(boletos)
    }
}
