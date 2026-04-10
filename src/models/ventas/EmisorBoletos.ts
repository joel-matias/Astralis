export class EmisorBoletos {

    generarQR(): string {
        return `QR-${crypto.randomUUID()}`
    }

    imprimir(): void {
        // Conexión con la impresora térmica local del POS
    }

    guardarDigital(): void {
        // Genera PDF y lo persiste en el repositorio
    }

    enviarEmail(dest: string): void {
        // ServicioEmail.send(dest, boleto.getPDF())
        void dest
    }
}
