// D8 CU3 — Acceso a datos para la entidad Horario
import type { Horario } from '@/models/horarios/Horario'

export class HorarioRepository {

    // Stub — persiste el horario en BD vía Prisma
    save(horario: Horario): void {
        void horario
    }

    findByRuta(rutaID: string): Horario[] {
        void rutaID
        return []
    }

    findConflictos(fecha: Date, hora: Date): Horario[] {
        void fecha
        void hora
        return []
    }
}
