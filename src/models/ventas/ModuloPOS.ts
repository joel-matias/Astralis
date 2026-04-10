import { BuscadorViajes } from './BuscadorViajes'
import { MapaAsientos } from './MapaAsientos'
import { Asiento } from './Asiento'

export class ModuloPOS {

    acceder(): void {
        // Verifica sesión activa del VendedorTaquilla
    }

    mostrarBuscador(): BuscadorViajes {
        return new BuscadorViajes()
    }

    calcularTotal(asientos: Asiento[]): number {
        // En la implementación real cada Asiento conoce su precio via el Boleto
        void asientos
        return 0
    }

    mostrarMapaAsientos(idViaje: string): MapaAsientos {
        return new MapaAsientos(idViaje)
    }

    confirmarVenta(): void {
        // Secuencia: ProcesadorPago → EmisorBoletos → GestorFiscal → LogVentas
    }
}
