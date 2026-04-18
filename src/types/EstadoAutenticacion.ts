// Diagrama de Estados — CU1: Iniciar Sesión
// Cada valor representa un estado del ciclo de vida del proceso de autenticación
export enum EstadoAutenticacion {
    EsperandoCredenciales  = 'EsperandoCredenciales',
    ValidandoCredenciales  = 'ValidandoCredenciales',
    CredencialesInvalidas  = 'CredencialesInvalidas',
    CuentaBloqueada        = 'CuentaBloqueada',
    VerificandoRol         = 'VerificandoRol',
    CreandoSesion          = 'CreandoSesion',
    SesionActiva           = 'SesionActiva',
    RedirigidoDashboard    = 'RedirigidoDashboard',

    // Flujo alternativo → redirige a CU4 (Recuperación de Contraseña)
    RecuperandoContrasena  = 'RecuperandoContrasena',
}
