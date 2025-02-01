-- Crear la base de datos con collation español
DROP DATABASE IF EXISTS app_gym;
CREATE DATABASE IF NOT EXISTS app_gym;

USE app_gym;

-- Crear tabla Membresias
CREATE TABLE Membresias (
    id_membresia INT AUTO_INCREMENT PRIMARY KEY,
    tipo_membresia ENUM('individual', 'familia', 'familia numerosa', 'discapacidad','trabajador') NOT NULL UNIQUE,
    precio DECIMAL(10, 2) NOT NULL
);

-- Crear tabla Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('cliente', 'entrenador', 'administrador') NOT NULL,
    id_membresia INT,
    FOREIGN KEY (id_membresia) REFERENCES Membresias(id_membresia)
);

-- Crear tabla Trabajadores
CREATE TABLE Trabajadores (
    id_trabajador INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    rol ENUM('entrenador', 'administrador') NOT NULL,
    fecha_contratacion DATE NOT NULL,
    telefono VARCHAR(15),
    beneficio_gratuito BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- Crear tabla Clases
CREATE TABLE Clases (
    id_clase INT AUTO_INCREMENT PRIMARY KEY,
    tipo_clase ENUM('Yoga','Crossfit','Zumba','Pilates','Boxeo','Ciclismo','Natacion') NOT NULL,
    descripcion TEXT    
);

-- Crear tabla Sesiones
CREATE TABLE Sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_clase INT NOT NULL,
    id_trabajador INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    capacidad_maxima INT NOT NULL CHECK (capacidad_maxima > 0 AND capacidad_maxima <= 15),
    asistentes_actuales INT DEFAULT 0 CHECK (asistentes_actuales <= 15),
    FOREIGN KEY (id_clase) REFERENCES Clases(id_clase),
    FOREIGN KEY (id_trabajador) REFERENCES Trabajadores(id_trabajador),
    CONSTRAINT CHK_Horario_Sesion CHECK (hora_inicio < hora_fin)
);

-- Crear tabla Reservas
CREATE TABLE Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sesion INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    estado ENUM('pendiente', 'cancelada', 'completada') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_sesion) REFERENCES Sesiones(id_sesion)
);

-- Crear tabla Pagos
CREATE TABLE Pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    metodo_pago ENUM('tarjeta', 'efectivo', 'transferencia') NOT NULL,
    fecha_pago DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- Crear tabla Registros de Turnos
CREATE TABLE Registros_Turnos (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajador INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME,
    FOREIGN KEY (id_trabajador) REFERENCES Trabajadores(id_trabajador),
    CONSTRAINT CHK_Horario_Turno CHECK (hora_salida IS NULL OR hora_entrada < hora_salida)
);
