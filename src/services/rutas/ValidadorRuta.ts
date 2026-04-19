// Valida los datos del formulario antes de que ControladorRutas proceda a guardar la ruta
export class ValidadorRuta {

    // Verifica que todos los campos de texto obligatorios estén completos
    validarCamposObligatorios(datos: Record<string, unknown>): boolean {
        const campos = ['codigoRuta', 'nombreRuta', 'ciudadOrigen', 'terminalOrigen', 'ciudadDestino', 'terminalDestino', 'tipoRuta', 'estado']
        return campos.every(campo => {
            const valor = datos[campo]
            return typeof valor === 'string' && valor.trim().length > 0
        })
    }

    // Evita que se cree una ruta con el mismo origen y destino
    validarOrigenDistintoDestino(origen: string, destino: string): boolean {
        return origen.trim().toLowerCase() !== destino.trim().toLowerCase()
    }

    // Verifica que distancia, tiempo y tarifa sean valores positivos
    validarValoresNumericos(distancia: number, tiempo: number, tarifa: number): boolean {
        return distancia > 0 && tiempo > 0 && tarifa > 0
    }
}
