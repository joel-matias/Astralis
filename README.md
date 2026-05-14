# ASTRALIS — Sistema de Gestión Integral para Central de Autobuses (SGICA)

**Universidad Tecnológica de la Mixteca**  
Materia: Desarrollo de Software Orientado a Objetos  
Semestre: 602-A | Profesor: IC. Carlos Alberto Martínez Sandoval  
Equipo 5:Aline Briseida Pérez Bautista, Emmanuel Cruz Victoriano, Samantha Betanzo Bolaños, Giovanni López Hernández, Joel Geovanny Matias Santiago

---

## Descripción del sistema

ASTRALIS es un portal web interno para la operación de una central de autobuses. Centraliza la gestión de rutas, programación de horarios, venta de boletos en taquilla, control de flota, administración de conductores, manejo de andenes y registro de equipaje. El acceso está protegido por roles: cada tipo de usuario ve únicamente las secciones que le corresponden.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) con TypeScript |
| UI / Estilos | Tailwind CSS v4 (configuración vía `@theme` en `globals.css`) |
| Fuentes | Geist, Manrope (titulares), Inter (cuerpo), Material Symbols Outlined (iconos) |
| Autenticación | next-auth v5 beta (`credentials` provider) |
| ORM | Prisma v6 |
| Base de datos | MySQL 8 |
| Testing E2E | Playwright |
| Gestor de paquetes | npm |

---

## Instalación

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/joel-matias/Astralis.git
cd Astralis
npm install --legacy-peer-deps

# 2. Copiar y completar variables de entorno
cp .env.example .env

# 3. Crear la base de datos en MySQL (si no existe)
# mysql -u root -p -e "CREATE DATABASE astralis;"

# 4. Aplicar migraciones y generar el cliente Prisma
npm run prisma:migrate

# 5. Cargar la semilla de datos
npm run prisma:seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

---

## Variables de entorno

Crear o editar el archivo `.env`:

```env
# Conexión a MySQL
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@localhost:3306/astralis"

# Secreto para next-auth (generar con: npx auth secret)
AUTH_SECRET="tu_secreto_aqui"

# SMTP para notificaciones de bloqueo de cuenta (opcional en desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=correo@gmail.com
SMTP_PASS=app_password
ADMIN_EMAIL=admin@astralis.mx
```

> En desarrollo, si no se configuran las variables SMTP el sistema funciona normalmente; solo omite el envío de correos al bloquear una cuenta.

---

## Usuarios de prueba

La semilla crea un usuario por cada rol del sistema. Todos redirigen automáticamente a su panel al iniciar sesión.

| Email | Contraseña | Rol | Panel de acceso |
|---|---|---|---|
| `admin@astralis.mx` | `admin1234` | ADMIN | `/admin/dashboard` |
| `gerente@astralis.mx` | `gerente1234` | GERENTE | `/operaciones/dashboard` |
| `vendedor@astralis.mx` | `vendedor1234` | VENDEDOR_TAQUILLA | `/pos` |
| `supervisor@astralis.mx` | `supervisor1234` | SUPERVISOR_ANDENES | `/andenes` |
| `equipaje@astralis.mx` | `equipaje1234` | ENCARGADO_EQUIPAJE | `/equipaje` |
| `despachador@astralis.mx` | `despacha1234` | DESPACHADOR_UNIDADES | `/admin/conductores` |

---

## Conductores de prueba

| Nombre | Licencia | Vencimiento | Estado |
|---|---|---|---|
| Juan Pérez González | LIC-98765 | 2027-06-30 | ACTIVO |
| María Sofía López Hernández | LIC-11111 | 2026-12-31 | ACTIVO |
| Carlos Eduardo Rodríguez Martínez | LIC-22222 | 2028-03-15 | ACTIVO |
| Ana Gabriela García Sánchez | LIC-33333 | 2027-09-20 | NO_DISPONIBLE |
| Roberto Mendoza Flores | LIC-44444 | 2025-06-01 | INACTIVO (licencia vencida) |
| Luis Alfonso Torres Vargas | LIC-55555 | 2029-01-10 | ACTIVO |

---

## Autobuses y rutas de prueba

**Autobuses**

| Económico | Marca / Modelo | Tipo | Asientos |
|---|---|---|---|
| AS-2345 | Volvo 9700 (2022) | EJECUTIVO | 4 |
| AS-3101 | Mercedes-Benz Torino 370 (2021) | LUJO | 6 |
| AS-4420 | Scania K410 (2020) | ECONOMICO | 8 |

> Capacidades reducidas para facilitar pruebas de POS sin crear muchos boletos.

**Rutas activas**

| Código | Origen → Destino | Tipo | Tarifa base |
|---|---|---|---|
| RUT-001 | Ciudad de México (TAPO) → Guadalajara | DIRECTA | $850 |
| RUT-002 | Oaxaca → Ciudad de México (TAPO) | CON_PARADAS | $720 |
| RUT-003 | Puebla (CAPU) → Veracruz | DIRECTA | $490 |

Las tres rutas tienen horario DIARIO con vigencia INDEFINIDA para que siempre aparezcan en la búsqueda del POS.

---

## Roles y permisos de ruta

La protección de rutas se implementa en `src/proxy.ts`:

| Prefijo de ruta | Roles permitidos |
|---|---|
| `/admin/horarios` | ADMIN, GERENTE |
| `/admin/rutas` | ADMIN, GERENTE |
| `/admin/flota` | ADMIN, GERENTE |
| `/admin/conductores` | ADMIN, GERENTE, DESPACHADOR_UNIDADES |
| `/admin` | ADMIN |
| `/pos` | ADMIN, VENDEDOR_TAQUILLA |
| `/andenes` | ADMIN, SUPERVISOR_ANDENES |
| `/equipaje` | ADMIN, ENCARGADO_EQUIPAJE |

Un usuario no autenticado es redirigido a `/login`. Un usuario sin permiso sobre una ruta protegida es redirigido a `/`.

---

## Estructura del proyecto

```
src/
├── app/                   # Rutas y páginas (Next.js App Router)
│   ├── page.tsx           # Raíz: redirige al panel según rol
│   ├── login/             # CU1 — pantalla de inicio de sesión
│   ├── admin/
│   │   ├── dashboard/     # Panel del administrador
│   │   ├── rutas/         # CU2 — gestión de rutas
│   │   ├── horarios/      # CU3 — programación de horarios
│   │   ├── flota/         # CU5 — gestión de flota
│   │   ├── conductores/   # CU6 — administración de conductores
│   │   └── andenes/       # Control de andenes (admin)
│   └── pos/               # CU4 — punto de venta de boletos
│
├── models/                # Clases de dominio (por módulo)
│   ├── seguridad/         # Usuario, Rol, SesionActiva, LogAuditoria
│   ├── rutas/             # Ruta, ParadaIntermedia
│   ├── horarios/          # Horario, Boleto, Autobus, Conductor
│   ├── boletos/           # VendedorTaquilla, Cliente, SistemaPago, etc.
│   ├── flota/             # Autobus, Mantenimiento, AsignacionAutobusViaje
│   ├── conductores/       # Conductor, AsignacionConductorViaje
│   ├── andenes/           # Anden, AsignacionAnden
│   └── equipaje/          # Equipaje
│
├── services/              # Lógica de negocio (por módulo)
│   ├── seguridad/         # AutenticacionService, ControladorAutenticacion, etc.
│   ├── rutas/             # ControladorRutas, GestorParadas, APIMapas, etc.
│   ├── horarios/          # HorarioService, ValidadorRecursos, FlotillaService, etc.
│   ├── boletos/           # ModuloPOS, BuscadorViajes, MapaAsientos, etc.
│   ├── flota/             # GestionRegistroAutobus, GestionEstadoAutobus, etc.
│   └── conductores/       # NegReg, NegEst, NegAsig, NegVal, NegAud
│
├── repositories/          # Acceso a datos vía Prisma (por módulo)
│   ├── seguridad/         # RepositorioUsuario, SesionRepository, LogRepository
│   ├── rutas/             # RepositorioRutas, RepositorioParadas
│   ├── horarios/          # HorarioRepository, BoletoRepository
│   ├── boletos/           # ViajeRepository, AsientoRepository
│   ├── flota/             # RepositorioAutobus, RepositorioMantenimiento
│   └── conductores/       # RepoCond, RepoAsig, RepoAud
│
├── auth.ts                # Configuración de next-auth
├── proxy.ts               # Protección de rutas por rol
└── components/            # Componentes UI compartidos
```

---

## Módulos implementados

| # | Módulo | Estado | Tests E2E |
|---|---|---|---|
| CU1 | Seguridad y Autenticación | Completo | 11/11 ✅ |
| CU2 | Administración de Rutas | Completo | 17/17 ✅ |
| CU3 | Programación de Horarios y Viajes | Completo | 15/15 ✅ |
| CU4 | Venta de Boletos (POS) | UI completa | Pendientes |
| CU5 | Gestión de Flota de Autobuses | UI completa | Pendientes |
| CU6 | Administración de Conductores | UI completa | Pendientes |
| CU7 | Control de Andenes | En progreso | Pendientes |
| CU8 | Gestión de Equipaje | Pendiente | Pendientes |

### CU1 — Seguridad y Autenticación
- Inicio de sesión con email y contraseña (bcrypt)
- Bloqueo temporal tras 3 intentos fallidos (15 minutos)
- Sesiones de 8 horas con invalidación automática
- Registro de todos los accesos en log de auditoría
- Notificación por correo al administrador al bloquear una cuenta
- Redirección automática al panel del rol correspondiente

### CU2 — Administración de Rutas
- Wizard multi-paso: datos básicos → paradas → mapa → activación
- Rutas DIRECTAS y CON_PARADAS
- Integración con Mapbox para cálculo de distancia y tiempo estimado
- Código autogenerado (`RUT-XXX`), toggle de estado con log de auditoría

### CU3 — Programación de Horarios y Viajes
- Frecuencia ÚNICO, DIARIO o SEMANAL; vigencia DEFINIDA o INDEFINIDA
- Validación de disponibilidad de autobús y conductor antes de guardar
- Precio calculado desde la tarifa base de la ruta
- Cancelación de horarios activos

### CU4 — Venta de Boletos (POS)
- Búsqueda de viajes por origen, destino y fecha
- Mapa de selección de asientos en tiempo real
- Pago en efectivo y con tarjeta (TPV)
- Código QR único por boleto y emisión de comprobante fiscal

### CU5 — Gestión de Flota
- Registro y actualización de autobuses (placas, VIN, capacidad, tipo de servicio)
- Cambio de estado: DISPONIBLE ↔ EN_MANTENIMIENTO ↔ FUERA_DE_SERVICIO
- Apertura y cierre de órdenes de mantenimiento (preventivo/correctivo)
- Asignación de autobús a horario de viaje y liberación

### CU6 — Administración de Conductores
- Registro y actualización de conductores (CURP, licencia, vigencia)
- Estados: ACTIVO ↔ NO_DISPONIBLE ↔ INACTIVO con control de sub-estado "asignado a viaje"
- Asignación a horario con detección de conflictos y reasignación automática

---

## Scripts disponibles

```bash
# Desarrollo
npm run dev                # Servidor en http://localhost:3000

# Base de datos
npm run prisma:migrate     # Aplica migraciones pendientes
npm run prisma:seed        # Carga la semilla de datos
npm run prisma:reset       # Reinicia la BD, re-migra y re-siembra (destructivo)
npm run prisma:studio      # Prisma Studio en http://localhost:5555
npm run prisma:generate    # Regenera el cliente Prisma
npm run prisma:push        # Sincroniza schema sin crear migración

# Calidad
npm run lint               # ESLint

# Pruebas E2E
npm run test:e2e           # Playwright headless
npm run test:e2e:ui        # Playwright con interfaz gráfica
npm run test:e2e:headed    # Playwright con navegador visible
```

---

## Arquitectura por capas

```
Página / Componente React
         │
         ▼
   Server Action          ← validación de entrada, 'use server'
         │
         ▼
   Service / Fachada      ← lógica de negocio, orquestación
         │
         ▼
   Repository             ← acceso a datos vía Prisma
         │
         ▼
       MySQL
```

Los modelos de dominio (`src/models/`) son clases TypeScript puras que encapsulan atributos y comportamientos. Los repositorios son los únicos que acceden a Prisma. Los servicios coordinan modelos y repositorios sin depender de la capa de UI.

---

## Decisiones técnicas relevantes

**`proxy.ts` en lugar de `middleware.ts`** — Next.js 16 no permite tener ambos archivos simultáneamente. La protección de rutas va exclusivamente en `src/proxy.ts`.

**Tailwind CSS v4** — La configuración del tema se hace en `globals.css` con `@theme`. No existe `tailwind.config.js`.

**Fechas y timezone** — El servidor corre en UTC-6. Los inputs `type="date"` se almacenan como UTC midnight. Para mostrar fechas correctamente siempre se usa `{ timeZone: 'UTC' }`. Los inputs `min` usan `fechaLocal()` (métodos locales, no `toISOString()`).

**Decimal de Prisma** — Los campos `Decimal` se convierten a `Number` antes de serializar datos hacia Client Components.

**Server Actions y render** — Los server actions no pueden invocarse durante el render inicial; las cargas al montar se hacen con `useEffect` + `useTransition`.

---

## Licencia

Proyecto académico — Universidad Tecnológica de la Mixteca, 2026.
