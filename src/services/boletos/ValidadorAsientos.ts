// D8 CU4 — paquete Logica de Negocio; valida que los asientos seleccionados estén disponibles
export class ValidadorAsientos {
    validarDisponibilidad(asientos: string[]): boolean { return false }
    validarSeleccion(asientos: string[], maxPasajeros: number): boolean { return false }
}
