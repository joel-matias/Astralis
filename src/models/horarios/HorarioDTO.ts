export interface HorarioDTO {
    rutaID: string
    autobusID: string
    conductorID: string
    fechaInicio: Date
    horaSalida: Date        // se usa solo la parte de hora (Time)
    frecuencia: string      // 'Unico' | 'Diario' | 'Semanal'
    vigencia: string        // 'Definida' | 'Indefinida'
}
