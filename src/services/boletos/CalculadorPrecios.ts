// D8 CU4 — paquete Logica de Negocio; calcula precio final aplicando tarifas y descuentos
export class CalculadorPrecios {
    calcularPrecioBase(precioRuta: number, numPasajeros: number): number { return precioRuta * numPasajeros }
    calcularPrecioFinal(precioBase: number, descuento: number): number { return precioBase - descuento }
}
