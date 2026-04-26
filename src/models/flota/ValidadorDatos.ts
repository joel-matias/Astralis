// D1, D4, D5, D2 — ValidadorDatos: valida campos, formatos e identifica duplicados
export class ValidadorDatos {

    // D4, D5 — verifica que todos los campos en el mapa tengan valor no vacío
    validarCamposObligatorios(datos: Map<string, unknown>): boolean {
        for (const [, valor] of datos) {
            if (valor === null || valor === undefined || String(valor).trim() === '') {
                return false
            }
        }
        return datos.size > 0
    }

    // D4, D5 — valida formatos: placas (alfanumérico 5-10), VIN (17 chars), año (rango válido)
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
        if (datos.has('capacidadAsientos')) {
            const cap = Number(datos.get('capacidadAsientos'))
            if (cap <= 8) return false
        }
        return true
    }

    // D4, D5 — retorna true si el valor ya existe (conflicto de duplicidad); implementación real: BaseDatos
    verificarDuplicidad(campo: string, valor: string): boolean {
        void campo; void valor
        return false
    }
}
