/**
 * Barrel de modelos — Proyecto Astralis
 * Re-exporta todos los modelos de dominio por CU.
 */

// CU1 — Seguridad y Autenticación
export * from './seguridad'

// CU2 — Administración de Rutas
export * from './rutas'

// CU3 — Programación de Horarios y Viajes
export * from './horarios'

// CU4 — Venta de Boletos (POS)
export * from './ventas'

// CU5 — Gestión de Flota
export * from './flota'

// CU6 — Administración de Conductores
export * from './conductores'

// CU7 — Control de Andenes
export * from './andenes'

// CU8 — Gestión de Equipaje
export * from './equipaje'

// Compartidas (cross-CU)
export * from './shared'
