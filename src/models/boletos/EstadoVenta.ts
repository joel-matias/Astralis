// D6 CU4 — Estados del flujo de venta de boleto en el POS
export type EstadoVenta =
    | 'Iniciado'                   // D6: vendedor accede al POS
    | 'BuscandoViaje'              // D6: ingresa criterios; loop si no hay viajes
    | 'ViajeSeleccionado'          // D6: selecciona viaje de la lista
    | 'AsientosReservados'         // D6: asientos bloqueados 5 minutos; loop si no disponibles
    | 'ProcesandoPago'             // D6: TPV activo, reserva vigente; puede cambiar forma de pago
    | 'PagoAprobado'               // D6: pago exitoso
    | 'PagoRechazado'              // D6: tarjeta rechazada; reserva extendida 5 min más
    | 'BoletoEmitido'              // D6: QR único generado e impreso
    | 'ComprobanteFiscalGenerado'  // D6: comprobante fiscal generado
    | 'VentaFinalizada'            // D6: email enviado, inventario actualizado
