/**
 * Enums del sistema
 */
export {
    // CU1 — Seguridad y Autenticación
    EstadoUsuario,

    // CU2 — Administración de Rutas
    TipoRuta,
    EstadoRuta,

    // CU3 — Programación de Horarios y Viajes
    FrecuenciaHorario,
    VigenciaHorario,
    EstadoHorario,

    // CU4 — Venta de Boletos (POS)
    EstadoBoleto,
    MetodoPago,
    EstadoVenta,

    // CU5 — Gestión de Flota
    TipoServicio,
    EstadoAutobus,
    TipoMantenimiento,

    // CU6 — Administración de Conductores
    EstadoConductor,

    // CU7 — Control de Andenes
    EstadoAnden,
    EstadoAsignacion,

    // CU8 — Gestión de Equipaje
    EstadoEquipaje,
} from '@prisma/client'
