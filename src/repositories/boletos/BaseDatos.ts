// D5 CU4 — Abstracción de acceso a BD; en el proyecto usa Prisma ORM (ver discrepancia D5)
// BuscadorViajes «consulta», MapaAsientos «consulta/actualiza», EmisordeBoletos «persiste»
export class BaseDatos {
    // D5: consultado por BuscadorViajes para obtener viajes disponibles
    consultarViajes(criterios: Record<string, unknown>): unknown[] { return [] }

    // D5: consultado y actualizado por MapaAsientos para disponibilidad y reservas
    consultarAsientos(idViaje: string): unknown[] { return [] }
    actualizarAsiento(idAsiento: string, datos: Record<string, unknown>): void {}

    // D5: usado por EmisordeBoletos para persistir boletos emitidos
    persistirBoleto(datos: Record<string, unknown>): void {}
}
