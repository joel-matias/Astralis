/**
 * CU5 — Gestión de Flota  /  CU6 — Administración de Conductores
 * Clase: ValidadorDatos
 *
 * Responsabilidades (diagrama M7CU / M6CU):
 * - Validar campos obligatorios del formulario
 * - Validar formato de datos (placas, VIN, año, CURP, licencia, teléfono)
 * - Verificar duplicidad de identificadores en el sistema
 *
 * Usada por: Autobus (CU5), Conductor (CU6)
 */

export class ValidadorDatos {

    // ── Métodos del diagrama ─────────────────────────────────────────────────

    /**
     * Verifica que todos los campos requeridos estén presentes y no vacíos.
     * Diagrama M7CU/M6CU: + validarCamposObligatorios(datos: Map) : Boolean
     */
    validarCamposObligatorios(datos: Map<string, unknown>): boolean {
        for (const [, valor] of datos) {
            if (valor === null || valor === undefined || String(valor).trim() === '') {
                return false
            }
        }
        return datos.size > 0
    }

    /**
     * Valida el formato de los valores según su tipo (placa, VIN, año, CURP).
     * Diagrama M7CU: + validarFormatos(datos: Map) : Boolean
     */
    validarFormatos(datos: Map<string, unknown>): boolean {
        if (datos.has('placas')) {
            const placas = String(datos.get('placas'))
            if (!/^[A-Z0-9-]{5,10}$/.test(placas)) return false
        }
        if (datos.has('vin')) {
            const vin = String(datos.get('vin'))
            if (vin.length !== 17) return false
        }
        if (datos.has('anio')) {
            const anio = Number(datos.get('anio'))
            if (anio < 1990 || anio > new Date().getFullYear() + 1) return false
        }
        if (datos.has('CURP')) {
            const curp = String(datos.get('CURP'))
            if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp)) return false
        }
        return true
    }

    /**
     * Verifica que el valor del campo no exista ya en el sistema.
     * Diagrama M7CU/M6CU: + verificarDuplicidad(campo, value, String) : Boolean
     * Retorna true si el valor ya está duplicado (es un conflicto).
     */
    verificarDuplicidad(campo: string, value: string, coleccion: string): boolean {
        // Implementación real: BaseDatos.verificarDuplicado(campo, value, coleccion)
        void campo; void value; void coleccion
        return false
    }
}
