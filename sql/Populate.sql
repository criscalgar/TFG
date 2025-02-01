
 DELIMITER //

CREATE OR REPLACE PROCEDURE populate()
BEGIN
    -- Desactivar restricciones de clave foránea
    SET FOREIGN_KEY_CHECKS=0;

    -- Eliminar datos existentes
    DELETE FROM Reservas;
    DELETE FROM Sesiones;
    DELETE FROM Clases;
    DELETE FROM Pagos;
    DELETE FROM Registros_Turnos;
    DELETE FROM Trabajadores;
    DELETE FROM Usuarios;
    DELETE FROM Membresias;

    -- Reiniciar AUTO_INCREMENT
    ALTER TABLE reservas AUTO_INCREMENT=1;
    ALTER TABLE Sesiones AUTO_INCREMENT=1;
    ALTER TABLE Clases AUTO_INCREMENT=1;
    ALTER TABLE Pagos AUTO_INCREMENT=1;
    ALTER TABLE Registros_Turnos AUTO_INCREMENT=1;
    ALTER TABLE Trabajadores AUTO_INCREMENT=1;
    ALTER TABLE Usuarios AUTO_INCREMENT=1;
    ALTER TABLE Membresias AUTO_INCREMENT=1;

    -- Insertar datos en Membresías
    INSERT INTO Membresias (tipo_membresia, precio) VALUES
    ('individual',25.00),
    ('familia', 15.00),
    ('familia numerosa', 20.00),
    ('discapacidad', 11.00),
    ('trabajador', 0.00);


    -- Insertar datos en la tabla Trabajadores
    INSERT INTO Trabajadores (id_usuario, rol, fecha_contratacion, telefono)
    VALUES
        (3, 'entrenador', '2023-01-01', '600123456'),
        (4, 'administrador', '2022-01-15', '600654321');

    -- Insertar datos en la tabla Clases
    INSERT INTO Clases (tipo_clase, descripcion)
    VALUES
        ('Yoga', 'Clase de yoga para principiantes'),
        ('Crossfit', 'Entrenamiento intenso para avanzados'),
        ('Zumba', 'Clase de baile y cardio');

    -- Insertar datos en la tabla Sesiones
    INSERT INTO Sesiones (id_clase, id_trabajador, fecha, hora_inicio, hora_fin, capacidad_maxima, asistentes_actuales)
    VALUES
        (1, 3, '2024-01-05', '09:00:00', '10:00:00', 15, 5),
        (2, 3, '2024-01-05', '11:00:00', '12:30:00', 15, 10),
        (3, 3, '2024-01-05', '18:00:00', '19:00:00', 15, 7);

    -- Insertar datos en la tabla Reservas
    INSERT INTO Reservas (id_usuario, id_sesion, fecha_reserva, estado)
    VALUES
        (1, 1, '2023-12-20', 'pendiente'),
        (2, 2, '2023-12-21', 'completada'),
        (1, 3, '2023-12-22', 'cancelada');

    -- Insertar datos en la tabla Pagos
    INSERT INTO Pagos (id_usuario, monto, metodo_pago, fecha_pago)
    VALUES
        (1, 25.00, 'tarjeta', '2023-12-01'),
        (2, 15.00, 'efectivo', '2023-12-02');


    -- Insertar datos en la tabla Registros_Turnos
    INSERT INTO Registros_Turnos (id_trabajador, fecha, hora_entrada, hora_salida)
    VALUES
        (3, '2023-12-20', '08:45:00', '14:00:00'),
        (4, '2023-12-20', '14:00:00', '18:00:00');

    -- Reactivar restricciones de clave foránea
    SET FOREIGN_KEY_CHECKS=1;
END //

DELIMITER ;

-- Llamar al procedimiento para poblar datos
CALL populate();
