export class ValidadorDatos {

    validarCamposObligatorios(datos: Map<string, unknown>): boolean {
        for (const [, valor] of datos) {
            if (valor === null || valor === undefined || String(valor).trim() === '') {
                return false
            }
        }
        return datos.size > 0
    }

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

    // Retorna true si el valor ya está duplicado (es un conflicto)
    // Implementación real: BaseDatos.verificarDuplicado(campo, value, coleccion)
    verificarDuplicidad(campo: string, value: string, coleccion: string): boolean {
        void campo; void value; void coleccion
        return false
    }
}
