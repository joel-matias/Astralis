// D5 CU4 — Sistema externo de email; usado por EmisordeBoletos para enviar confirmaciones
export class ServicioEmail {
    // D5: envía email de confirmación de venta al destinatario
    enviar(destinatario: string, asunto: string, cuerpo: string): void {}
}
