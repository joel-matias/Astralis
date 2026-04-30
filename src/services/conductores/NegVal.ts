// D7 CU6 — NegVal: Servicio Validación — orquesta ValidadorDatos + verificación de unicidad en BD
import { ValidadorDatos } from '@/models/conductores/ValidadorDatos'
import { BaseDatos } from './BaseDatos'

export class NegVal {
    private validador: ValidadorDatos
    private bd: BaseDatos

    constructor() {
        this.validador = new ValidadorDatos()
        this.bd = new BaseDatos()
    }

    async validarRegistro(datos: Map<string, unknown>, excludeID?: string): Promise<{ valido: boolean; error?: string }> {
        if (!this.validador.validarCamposObligatorios(datos)) {
            return { valido: false, error: 'Faltan campos obligatorios' }
        }
        if (!this.validador.validarFormatos(datos)) {
            return { valido: false, error: 'Formato inválido en CURP, licencia o teléfono' }
        }
        const curp = datos.get('curp') as string
        const licencia = datos.get('numeroLicencia') as string
        const duplicado = await this.bd.verificarDuplicidad(curp, licencia, excludeID)
        if (duplicado) {
            return { valido: false, error: 'CURP o número de licencia ya registrado en el sistema' }
        }
        return { valido: true }
    }
}
