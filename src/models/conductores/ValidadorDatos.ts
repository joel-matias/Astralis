// D2, D3 CU6 — Valida campos obligatorios, formatos e identifica duplicidad de identificadores
export class ValidadorDatos {
    // D3: validarCamposObligatorios(datos: Map): boolean
    validarCamposObligatorios(datos: Map<string, unknown>): boolean {
        const requeridos = ['nombreCompleto', 'curp', 'numeroLicencia', 'vigenciaLicencia']
        return requeridos.every(campo => {
            const val = datos.get(campo)
            return val !== undefined && val !== null && val !== ''
        })
    }

    // D3: validarFormatos(datos: Map): boolean — CURP, licencia y teléfono (D1: deben ser únicos y con formato válido)
    validarFormatos(datos: Map<string, unknown>): boolean {
        const curp = datos.get('curp') as string | undefined
        const licencia = datos.get('numeroLicencia') as string | undefined
        const telefono = datos.get('numeroTelefonico') as string | undefined

        if (curp && !/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/.test(curp)) return false
        if (licencia && licencia.trim().length < 5) return false
        if (telefono && !/^\d{10}$/.test(telefono.replace(/[\s-]/g, ''))) return false
        return true
    }

    // D3: verificarDuplicidad(campo: String, valor: String): boolean — delega a RepoCond en BD
    verificarDuplicidad(campo: string, valor: string): boolean {
        void campo; void valor
        return true
    }
}
