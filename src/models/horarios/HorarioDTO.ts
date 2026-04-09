/**
 * CU3 — Programación de Horarios y Viajes
 * DTO: HorarioDTO  «DTO»
 *
 * Diagrama de Dependencias (CU3):
 * - rutaID : String
 * - autobusID : String
 * - conductorID : String
 * - fechaInicio : Date
 * - horaSalida : Time
 * - frecuencia : String
 * - vigencia : String
 *
 * Transporta datos del formulario al HorarioService.
 */

export interface HorarioDTO {
    rutaID: string
    autobusID: string
    conductorID: string
    fechaInicio: Date
    horaSalida: Date        // se usa solo la parte de hora (Time)
    frecuencia: string      // 'Unico' | 'Diario' | 'Semanal'
    vigencia: string        // 'Definida' | 'Indefinida'
}
