
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
    DELETE FROM Mensajes;
    DELETE FROM Usuarios;
    DELETE FROM Membresias;

    -- Reiniciar AUTO_INCREMENT
    ALTER TABLE reservas AUTO_INCREMENT=1;
    ALTER TABLE Sesiones AUTO_INCREMENT=1;
    ALTER TABLE Clases AUTO_INCREMENT=1;
    ALTER TABLE Pagos AUTO_INCREMENT=1;
    ALTER TABLE Registros_Turnos AUTO_INCREMENT=1;
    ALTER TABLE Trabajadores AUTO_INCREMENT=1;
    ALTER TABLE Mensajes AUTO_INCREMENT=1;
    ALTER TABLE Usuarios AUTO_INCREMENT=1;
    ALTER TABLE Membresias AUTO_INCREMENT=1;

    -- Insertar datos en Membresías
    INSERT INTO Membresias (tipo_membresia, precio) VALUES
    ('individual',25.00),
    ('familia', 15.00),
    ('familia numerosa', 20.00),
    ('discapacidad', 11.00),
    ('trabajador', 0.00);
    
    INSERT INTO Mensajes (id_usuario, texto, timestamp) VALUES
	(1, '¡Hola! ¿A qué hora es la clase de Zumba?', '2025-02-01 10:15:00'),
	(3, 'Hola Carlos, la clase de Zumba empieza a las 12:00.', '2025-02-01 10:17:00'),
	(2, '¿Puedo apuntarme a la clase de Yoga de mañana?', '2025-02-02 15:00:00'),
	(4, 'Sí Ana, aún hay plazas disponibles.', '2025-02-02 15:02:00'),
	(5, 'Por favor, recuerden que deben confirmar asistencia antes de las 18:00.', '2025-02-02 16:30:00');



    -- Insertar datos en la tabla Trabajadores
    INSERT INTO Trabajadores (id_usuario, rol, fecha_contratacion, telefono)
    VALUES
        (3, 'entrenador', '2023-01-01', '600123456'),
        (4, 'administrador', '2022-01-15', '600654321'),
        (5, 'administrador', '2020-05-29', '675459876');
        


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
        (1, 25.00, 'tarjeta', '2025-02-01'),
        (2, 15.00, 'efectivo', '2023-12-02');


    -- Insertar registros para todos los meses de 2024 y hasta febrero de 2025
INSERT INTO Registros_Turnos (id_trabajador, fecha, hora_entrada, hora_salida) VALUES
	-- ✅ Enero 2024
	(1, '2024-01-10', '08:00:00', '16:00:00'),
	(2, '2024-01-15', '09:00:00', '17:00:00'),
	(3, '2024-01-20', '07:30:00', '15:30:00'),
	
	-- ✅ Febrero 2024
	(1, '2024-02-05', '08:15:00', '16:30:00'),
	(2, '2024-02-18', '10:00:00', '18:00:00'),
	(3, '2024-02-22', '07:45:00', '14:45:00'),
	
	-- ✅ Marzo 2024
	(1, '2024-03-12', '08:00:00', '16:00:00'),
	(2, '2024-03-20', '09:15:00', '17:15:00'),
	(3, '2024-03-25', '07:30:00', '15:00:00'),
	
	-- ✅ Abril 2024
	(1, '2024-04-08', '08:30:00', '16:30:00'),
	(2, '2024-04-14', '10:00:00', '18:00:00'),
	(3, '2024-04-29', '07:15:00', '14:45:00'),
	
	-- ✅ Mayo 2024
	(1, '2024-05-03', '08:00:00', '16:00:00'),
	(2, '2024-05-19', '09:45:00', '17:30:00'),
	(3, '2024-05-27', '07:00:00', '15:00:00'),
	
	-- ✅ Junio 2024
	(1, '2024-06-07', '08:30:00', '16:30:00'),
	(2, '2024-06-15', '10:00:00', '18:00:00'),
	(3, '2024-06-24', '07:15:00', '14:30:00'),
	
	-- ✅ Julio 2024
	(1, '2024-07-02', '08:15:00', '16:15:00'),
	(2, '2024-07-21', '09:30:00', '17:45:00'),
	(3, '2024-07-28', '07:45:00', '15:15:00'),
	
	-- ✅ Agosto 2024
	(1, '2024-08-09', '08:00:00', '16:00:00'),
	(2, '2024-08-14', '09:45:00', '17:30:00'),
	(3, '2024-08-22', '07:30:00', '15:00:00'),
	
	-- ✅ Septiembre 2024
	(1, '2024-09-05', '08:30:00', '16:30:00'),
	(2, '2024-09-18', '10:00:00', '18:00:00'),
	(3, '2024-09-23', '07:15:00', '14:45:00'),
	
	-- ✅ Octubre 2024
	(1, '2024-10-10', '08:00:00', '16:00:00'),
	(2, '2024-10-17', '09:15:00', '17:15:00'),
	(3, '2024-10-29', '07:30:00', '15:00:00'),
	
	-- ✅ Noviembre 2024
	(1, '2024-11-04', '08:30:00', '16:30:00'),
	(2, '2024-11-13', '10:00:00', '18:00:00'),
	(3, '2024-11-22', '07:15:00', '14:45:00'),
	
	-- ✅ Diciembre 2024
	(1, '2024-12-08', '08:00:00', '16:00:00'),
	(2, '2024-12-19', '09:45:00', '17:30:00'),
	(3, '2024-12-25', '07:00:00', '15:00:00'),
	
	-- ✅ Enero 2025
	(1, '2025-01-06', '08:15:00', '16:15:00'),
	(2, '2025-01-20', '09:30:00', '17:45:00'),
	(3, '2025-01-28', '07:45:00', '15:15:00'),
	
	-- ✅ Febrero 2025
	(1, '2025-02-09', '08:00:00', '16:00:00'),
	(2, '2025-02-14', '09:45:00', '17:30:00'),
	(3, '2025-02-22', '07:30:00', '15:00:00');


    -- Reactivar restricciones de clave foránea
    SET FOREIGN_KEY_CHECKS=1;
END //

DELIMITER ;

-- Llamar al procedimiento para poblar datos
CALL populate();
