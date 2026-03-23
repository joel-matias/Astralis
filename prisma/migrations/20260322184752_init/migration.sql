-- CreateTable
CREATE TABLE `roles` (
    `rolID` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`rolID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisos` (
    `permisoID` VARCHAR(36) NOT NULL,
    `rolID` VARCHAR(36) NOT NULL,
    `accion` VARCHAR(100) NOT NULL,
    `modulo` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `permisos_rolID_accion_key`(`rolID`, `accion`),
    PRIMARY KEY (`permisoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `usuarioID` VARCHAR(36) NOT NULL,
    `nombreCompleto` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `contrasenaHash` VARCHAR(255) NOT NULL,
    `intentosFallidos` TINYINT NOT NULL DEFAULT 0,
    `estado` ENUM('ACTIVO', 'BLOQUEADO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `rolID` VARCHAR(36) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`usuarioID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones_activas` (
    `sesionID` VARCHAR(36) NOT NULL,
    `usuarioID` VARCHAR(36) NOT NULL,
    `tokenAcceso` VARCHAR(512) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaExpiracion` DATETIME(3) NOT NULL,
    `ipOrigen` VARCHAR(45) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `sesiones_activas_tokenAcceso_key`(`tokenAcceso`),
    INDEX `sesiones_activas_usuarioID_idx`(`usuarioID`),
    INDEX `sesiones_activas_tokenAcceso_idx`(`tokenAcceso`),
    PRIMARY KEY (`sesionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_auditoria` (
    `logID` VARCHAR(36) NOT NULL,
    `usuarioID` VARCHAR(36) NULL,
    `accion` VARCHAR(100) NOT NULL,
    `modulo` VARCHAR(50) NOT NULL,
    `resultado` VARCHAR(20) NOT NULL,
    `detalles` TEXT NULL,
    `ipOrigen` VARCHAR(45) NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `log_auditoria_usuarioID_idx`(`usuarioID`),
    INDEX `log_auditoria_fechaHora_idx`(`fechaHora`),
    INDEX `log_auditoria_modulo_accion_idx`(`modulo`, `accion`),
    PRIMARY KEY (`logID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rutas` (
    `rutaID` VARCHAR(36) NOT NULL,
    `codigoRuta` VARCHAR(20) NOT NULL,
    `nombreRuta` VARCHAR(150) NOT NULL,
    `ciudadOrigen` VARCHAR(100) NOT NULL,
    `ciudadDestino` VARCHAR(100) NOT NULL,
    `terminalOrigen` VARCHAR(150) NOT NULL,
    `terminalDestino` VARCHAR(150) NOT NULL,
    `distanciaKm` DECIMAL(8, 2) NOT NULL,
    `tiempoEstimadoHrs` DECIMAL(5, 2) NOT NULL,
    `tipoRuta` ENUM('DIRECTA', 'CON_PARADAS') NOT NULL DEFAULT 'DIRECTA',
    `tarifaBase` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'INACTIVA',
    `creadoPorID` VARCHAR(36) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rutas_codigoRuta_key`(`codigoRuta`),
    INDEX `rutas_ciudadOrigen_ciudadDestino_idx`(`ciudadOrigen`, `ciudadDestino`),
    INDEX `rutas_estado_idx`(`estado`),
    PRIMARY KEY (`rutaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paradas_intermedias` (
    `paradaID` VARCHAR(36) NOT NULL,
    `rutaID` VARCHAR(36) NOT NULL,
    `nombreParada` VARCHAR(150) NOT NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `ordenEnRuta` TINYINT NOT NULL,
    `distanciaDesdeOrigenKm` DECIMAL(8, 2) NOT NULL,
    `tiempoEsperaMin` SMALLINT NOT NULL DEFAULT 0,
    `tarifaDesdeOrigen` DECIMAL(10, 2) NOT NULL,

    INDEX `paradas_intermedias_rutaID_idx`(`rutaID`),
    UNIQUE INDEX `paradas_intermedias_rutaID_ordenEnRuta_key`(`rutaID`, `ordenEnRuta`),
    PRIMARY KEY (`paradaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios` (
    `horarioID` VARCHAR(36) NOT NULL,
    `rutaID` VARCHAR(36) NOT NULL,
    `autobusID` VARCHAR(36) NOT NULL,
    `conductorID` VARCHAR(36) NOT NULL,
    `programadoPorID` VARCHAR(36) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `horaSalida` TIME NOT NULL,
    `frecuencia` ENUM('UNICO', 'DIARIO', 'SEMANAL') NOT NULL,
    `vigencia` ENUM('DEFINIDA', 'INDEFINIDA') NOT NULL DEFAULT 'INDEFINIDA',
    `fechaFin` DATETIME(3) NULL,
    `precioBase` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('ACTIVO', 'CANCELADO', 'COMPLETADO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `horarios_rutaID_idx`(`rutaID`),
    INDEX `horarios_autobusID_fechaInicio_idx`(`autobusID`, `fechaInicio`),
    INDEX `horarios_conductorID_fechaInicio_idx`(`conductorID`, `fechaInicio`),
    PRIMARY KEY (`horarioID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `clienteID` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NULL,
    `edad` TINYINT NULL,
    `documento` VARCHAR(30) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clienteID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventas` (
    `ventaID` VARCHAR(36) NOT NULL,
    `vendedorID` VARCHAR(36) NOT NULL,
    `metodoPago` ENUM('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO') NOT NULL,
    `montoTotal` DECIMAL(10, 2) NOT NULL,
    `cambioEntregado` DECIMAL(10, 2) NULL,
    `idTransaccion` VARCHAR(100) NULL,
    `estado` ENUM('COMPLETADA', 'CANCELADA', 'REEMBOLSADA') NOT NULL DEFAULT 'COMPLETADA',
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ventas_vendedorID_idx`(`vendedorID`),
    INDEX `ventas_fechaHora_idx`(`fechaHora`),
    PRIMARY KEY (`ventaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boletos` (
    `boletoID` VARCHAR(36) NOT NULL,
    `horarioID` VARCHAR(36) NOT NULL,
    `clienteID` VARCHAR(36) NOT NULL,
    `ventaID` VARCHAR(36) NULL,
    `asientoID` VARCHAR(36) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `codigoQR` VARCHAR(255) NOT NULL,
    `estado` ENUM('DISPONIBLE', 'VENDIDO', 'CANCELADO') NOT NULL DEFAULT 'DISPONIBLE',
    `fechaVenta` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `boletos_codigoQR_key`(`codigoQR`),
    INDEX `boletos_horarioID_estado_idx`(`horarioID`, `estado`),
    INDEX `boletos_ventaID_idx`(`ventaID`),
    PRIMARY KEY (`boletoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asientos` (
    `asientoID` VARCHAR(36) NOT NULL,
    `autobusID` VARCHAR(36) NOT NULL,
    `numero` VARCHAR(5) NOT NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `reservadoHasta` DATETIME(3) NULL,

    INDEX `asientos_autobusID_idx`(`autobusID`),
    UNIQUE INDEX `asientos_autobusID_numero_key`(`autobusID`, `numero`),
    PRIMARY KEY (`asientoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comprobantes_fiscales` (
    `comprobanteID` VARCHAR(36) NOT NULL,
    `ventaID` VARCHAR(36) NOT NULL,
    `folio` VARCHAR(50) NOT NULL,
    `montoTotal` DECIMAL(10, 2) NOT NULL,
    `fechaEmision` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `urlImpresion` VARCHAR(500) NULL,

    UNIQUE INDEX `comprobantes_fiscales_ventaID_key`(`ventaID`),
    UNIQUE INDEX `comprobantes_fiscales_folio_key`(`folio`),
    PRIMARY KEY (`comprobanteID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `autobuses` (
    `autobusID` VARCHAR(36) NOT NULL,
    `numeroEconomico` VARCHAR(20) NOT NULL,
    `placas` VARCHAR(10) NOT NULL,
    `vin` VARCHAR(17) NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(50) NOT NULL,
    `anio` SMALLINT NOT NULL,
    `capacidadAsientos` TINYINT NOT NULL,
    `tipoServicio` ENUM('ECONOMICO', 'EJECUTIVO', 'LUJO') NOT NULL,
    `estadoOperativo` ENUM('DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') NOT NULL DEFAULT 'DISPONIBLE',
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimoMantenimiento` DATETIME(3) NULL,

    UNIQUE INDEX `autobuses_numeroEconomico_key`(`numeroEconomico`),
    UNIQUE INDEX `autobuses_placas_key`(`placas`),
    UNIQUE INDEX `autobuses_vin_key`(`vin`),
    INDEX `autobuses_estadoOperativo_idx`(`estadoOperativo`),
    PRIMARY KEY (`autobusID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mantenimientos` (
    `mantenimientoID` VARCHAR(36) NOT NULL,
    `autobusID` VARCHAR(36) NOT NULL,
    `tipo` ENUM('PREVENTIVO', 'CORRECTIVO') NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NULL,
    `kilometraje` DECIMAL(10, 2) NULL,
    `descripcionActividad` TEXT NOT NULL,
    `responsable` VARCHAR(100) NOT NULL,
    `refaccionesInsumos` TEXT NULL,
    `observaciones` TEXT NULL,
    `estaAbierto` BOOLEAN NOT NULL DEFAULT true,

    INDEX `mantenimientos_autobusID_estaAbierto_idx`(`autobusID`, `estaAbierto`),
    PRIMARY KEY (`mantenimientoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciones_autobus_viaje` (
    `asignacionID` VARCHAR(36) NOT NULL,
    `autobusID` VARCHAR(36) NOT NULL,
    `horarioID` VARCHAR(36) NOT NULL,
    `conductorID` VARCHAR(36) NOT NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` TEXT NULL,
    `liberado` BOOLEAN NOT NULL DEFAULT false,
    `fechaLiberacion` DATETIME(3) NULL,

    INDEX `asignaciones_autobus_viaje_autobusID_idx`(`autobusID`),
    INDEX `asignaciones_autobus_viaje_conductorID_idx`(`conductorID`),
    UNIQUE INDEX `asignaciones_autobus_viaje_horarioID_key`(`horarioID`),
    PRIMARY KEY (`asignacionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conductores` (
    `conductorID` VARCHAR(36) NOT NULL,
    `nombreCompleto` VARCHAR(100) NOT NULL,
    `curp` VARCHAR(18) NOT NULL,
    `numeroLicencia` VARCHAR(20) NOT NULL,
    `vigenciaLicencia` DATETIME(3) NOT NULL,
    `domicilio` VARCHAR(255) NULL,
    `numeroTelefonico` VARCHAR(15) NULL,
    `horasAcumuladas` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    `disponible` BOOLEAN NOT NULL DEFAULT true,
    `estado` ENUM('ACTIVO', 'NO_DISPONIBLE', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `motivoBaja` TEXT NULL,
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conductores_curp_key`(`curp`),
    UNIQUE INDEX `conductores_numeroLicencia_key`(`numeroLicencia`),
    INDEX `conductores_estado_disponible_idx`(`estado`, `disponible`),
    PRIMARY KEY (`conductorID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciones_conductor_viaje` (
    `asignacionID` VARCHAR(36) NOT NULL,
    `conductorID` VARCHAR(36) NOT NULL,
    `horarioID` VARCHAR(36) NOT NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` TEXT NULL,
    `liberado` BOOLEAN NOT NULL DEFAULT false,
    `fechaLiberacion` DATETIME(3) NULL,

    INDEX `asignaciones_conductor_viaje_conductorID_idx`(`conductorID`),
    UNIQUE INDEX `asignaciones_conductor_viaje_horarioID_key`(`horarioID`),
    PRIMARY KEY (`asignacionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `andenes` (
    `andenID` VARCHAR(36) NOT NULL,
    `numero` INTEGER NOT NULL,
    `capacidad` TINYINT NOT NULL,
    `estado` ENUM('DISPONIBLE', 'RESERVADO', 'OCUPADO') NOT NULL DEFAULT 'DISPONIBLE',
    `horarioDisponible` VARCHAR(100) NULL,

    PRIMARY KEY (`andenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciones_anden` (
    `asignacionID` VARCHAR(36) NOT NULL,
    `andenID` VARCHAR(36) NOT NULL,
    `horarioID` VARCHAR(36) NOT NULL,
    `supervisorID` VARCHAR(36) NOT NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('RESERVADO', 'OCUPADO', 'LIBERADO') NOT NULL DEFAULT 'RESERVADO',
    `cancelada` BOOLEAN NOT NULL DEFAULT false,

    INDEX `asignaciones_anden_andenID_estado_idx`(`andenID`, `estado`),
    PRIMARY KEY (`asignacionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipajes` (
    `equipajeID` VARCHAR(36) NOT NULL,
    `boletoID` VARCHAR(36) NOT NULL,
    `cantidadPiezas` TINYINT NOT NULL,
    `tipoEquipaje` VARCHAR(50) NOT NULL,
    `pesoAproximadoKg` DECIMAL(5, 2) NOT NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('REGISTRADO', 'EMBARCADO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'REGISTRADO',
    `registradoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `equipajes_boletoID_idx`(`boletoID`),
    PRIMARY KEY (`equipajeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `permisos` ADD CONSTRAINT `permisos_rolID_fkey` FOREIGN KEY (`rolID`) REFERENCES `roles`(`rolID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rolID_fkey` FOREIGN KEY (`rolID`) REFERENCES `roles`(`rolID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones_activas` ADD CONSTRAINT `sesiones_activas_usuarioID_fkey` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios`(`usuarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_auditoria` ADD CONSTRAINT `log_auditoria_usuarioID_fkey` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios`(`usuarioID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rutas` ADD CONSTRAINT `rutas_creadoPorID_fkey` FOREIGN KEY (`creadoPorID`) REFERENCES `usuarios`(`usuarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paradas_intermedias` ADD CONSTRAINT `paradas_intermedias_rutaID_fkey` FOREIGN KEY (`rutaID`) REFERENCES `rutas`(`rutaID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios` ADD CONSTRAINT `horarios_rutaID_fkey` FOREIGN KEY (`rutaID`) REFERENCES `rutas`(`rutaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios` ADD CONSTRAINT `horarios_autobusID_fkey` FOREIGN KEY (`autobusID`) REFERENCES `autobuses`(`autobusID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios` ADD CONSTRAINT `horarios_conductorID_fkey` FOREIGN KEY (`conductorID`) REFERENCES `conductores`(`conductorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios` ADD CONSTRAINT `horarios_programadoPorID_fkey` FOREIGN KEY (`programadoPorID`) REFERENCES `usuarios`(`usuarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boletos` ADD CONSTRAINT `boletos_horarioID_fkey` FOREIGN KEY (`horarioID`) REFERENCES `horarios`(`horarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boletos` ADD CONSTRAINT `boletos_clienteID_fkey` FOREIGN KEY (`clienteID`) REFERENCES `clientes`(`clienteID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boletos` ADD CONSTRAINT `boletos_ventaID_fkey` FOREIGN KEY (`ventaID`) REFERENCES `ventas`(`ventaID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boletos` ADD CONSTRAINT `boletos_asientoID_fkey` FOREIGN KEY (`asientoID`) REFERENCES `asientos`(`asientoID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asientos` ADD CONSTRAINT `asientos_autobusID_fkey` FOREIGN KEY (`autobusID`) REFERENCES `autobuses`(`autobusID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comprobantes_fiscales` ADD CONSTRAINT `comprobantes_fiscales_ventaID_fkey` FOREIGN KEY (`ventaID`) REFERENCES `ventas`(`ventaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mantenimientos` ADD CONSTRAINT `mantenimientos_autobusID_fkey` FOREIGN KEY (`autobusID`) REFERENCES `autobuses`(`autobusID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_autobus_viaje` ADD CONSTRAINT `asignaciones_autobus_viaje_autobusID_fkey` FOREIGN KEY (`autobusID`) REFERENCES `autobuses`(`autobusID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_autobus_viaje` ADD CONSTRAINT `asignaciones_autobus_viaje_horarioID_fkey` FOREIGN KEY (`horarioID`) REFERENCES `horarios`(`horarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_autobus_viaje` ADD CONSTRAINT `asignaciones_autobus_viaje_conductorID_fkey` FOREIGN KEY (`conductorID`) REFERENCES `conductores`(`conductorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_conductor_viaje` ADD CONSTRAINT `asignaciones_conductor_viaje_conductorID_fkey` FOREIGN KEY (`conductorID`) REFERENCES `conductores`(`conductorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_conductor_viaje` ADD CONSTRAINT `asignaciones_conductor_viaje_horarioID_fkey` FOREIGN KEY (`horarioID`) REFERENCES `horarios`(`horarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_anden` ADD CONSTRAINT `asignaciones_anden_andenID_fkey` FOREIGN KEY (`andenID`) REFERENCES `andenes`(`andenID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_anden` ADD CONSTRAINT `asignaciones_anden_horarioID_fkey` FOREIGN KEY (`horarioID`) REFERENCES `horarios`(`horarioID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipajes` ADD CONSTRAINT `equipajes_boletoID_fkey` FOREIGN KEY (`boletoID`) REFERENCES `boletos`(`boletoID`) ON DELETE RESTRICT ON UPDATE CASCADE;
