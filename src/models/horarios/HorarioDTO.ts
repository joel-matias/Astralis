// D4 CU3 — DTO que transporta los datos del formulario hacia HorarioService
import type { FrecuenciaHorario, VigenciaHorario, EstadoHorario } from './Horario'

export interface HorarioDTO {
    rutaID: string
    autobusID: string
    conductorID: string
    fechaInicio: Date
    horaSalida: Date
    frecuencia: FrecuenciaHorario
    vigencia: VigenciaHorario
    precioBase: number
    estado?: EstadoHorario
    fechaFin?: Date
    programadoPorID: string
}
