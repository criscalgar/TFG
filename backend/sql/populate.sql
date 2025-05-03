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
    DELETE FROM Notificaciones;
    DELETE FROM MensajesLeidos;
    DELETE FROM Mensajes;
    DELETE FROM HorarioLaboral;
    DELETE FROM Usuarios;
    DELETE FROM Membresias;

    -- Reiniciar AUTO_INCREMENT
    ALTER TABLE Reservas AUTO_INCREMENT=1;
    ALTER TABLE Sesiones AUTO_INCREMENT=1;
    ALTER TABLE Clases AUTO_INCREMENT=1;
    ALTER TABLE Pagos AUTO_INCREMENT=1;
    ALTER TABLE Registros_Turnos AUTO_INCREMENT=1;
    ALTER TABLE Notificaciones AUTO_INCREMENT=1;
    ALTER TABLE MensajesLeidos AUTO_INCREMENT=1;
    ALTER TABLE Mensajes AUTO_INCREMENT=1;
    ALTER TABLE HorarioLaboral AUTO_INCREMENT=1;
    ALTER TABLE Usuarios AUTO_INCREMENT=1;
    ALTER TABLE Membresias AUTO_INCREMENT=1;

    -- Insertar datos en Membresías
    INSERT INTO Membresias (tipo_membresia, precio) VALUES
    ('individual',25.00),
    ('familia', 15.00),
    ('familia numerosa', 20.00),
    ('discapacidad', 11.00),
    ('trabajador', 0.00);

	INSERT INTO HorarioLaboral (id_usuario, fecha, hora_entrada, hora_salida) VALUES
    (3, '2025-09-10', '08:00', '15:00'),
    (3, '2025-09-11', '15:00', '23:00'),
    (3, '2025-03-08', '12:00', '18:00'),

    (4, '2025-09-11', '08:00', '15:00'),
    (4, '2025-03-07', '11:00', '15:00'),

    (5, '2025-09-14', '15:00', '23:00'),
    (5, '2025-03-07', '09:00', '14:00');

	
-- Insertar datos en la tabla Mensajes (Chat grupal)

INSERT INTO Mensajes (id_usuario, texto, timestamp, fecha_envio) VALUES
    (1, '¡Hola a todos! ¿Quién viene a la clase de yoga hoy?', '2025-02-22 08:30:00', '2025-02-22'),
    (2, 'Yo estaré en la sesión de Crossfit, ¡nos vemos allí!', '2025-02-22 09:15:00', '2025-02-22'),
    (3, 'Recuerden calentar bien antes de empezar el entrenamiento.', '2025-02-22 09:45:00', '2025-02-22'),
    (4, 'Este fin de semana habrá jornada de puertas abiertas. ¡Inviten a sus amigos!', '2025-02-22 10:00:00', '2025-02-22'),
    (5, 'Recuerden pagar la cuota antes de fin de mes para evitar problemas de acceso.', '2025-02-22 11:00:00', '2025-02-22'),
    (1, '¿Alguien quiere compartir un entrenamiento HIIT esta tarde?', '2025-02-22 15:00:00', '2025-02-22'),
    (3, 'Las nuevas pesas han llegado al gimnasio, ¡pruébenlas!', '2025-02-22 16:20:00', '2025-02-22'),
    (2, '¿Qué tal estuvo la clase de spinning hoy?', '2025-02-22 17:00:00', '2025-02-22'),
    (4, 'A partir de la próxima semana habrá una nueva clase de pilates.', '2025-02-22 18:00:00', '2025-02-22'),
    (5, 'Aviso: El gimnasio cerrará a las 21:00 hoy por mantenimiento.', '2025-02-22 19:30:00', '2025-02-22');

    
    -- Insertar datos en la tabla MensajesLeidos (Usuarios que han leído los mensajes)
	INSERT INTO MensajesLeidos (id_usuario, id_mensaje) VALUES
    (1, 1), (1, 2), (1, 3),  -- El usuario 1 ha leído los tres primeros mensajes
    (2, 1), (2, 2),          -- El usuario 2 ha leído los dos primeros mensajes
    (3, 1), (3, 3), (3, 4),  -- El usuario 3 ha leído los mensajes 1, 3 y 4
    (4, 2), (4, 3), (4, 4), (4, 5), -- El usuario 4 ha leído los mensajes 2 a 5
    (5, 1), (5, 2), (5, 3), (5, 4), (5, 5); -- El usuario 5 ha leído todos los mensajes hasta el 5



   -- Insertar datos en la tabla Notificaciones
INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) VALUES
    -- 🔹 Notificaciones para Carlos (cliente)
    (1, 'Tu cuota mensual vence en 3 días. Realiza el pago para evitar restricciones.', 'no leido', '2025-02-22 12:00:00'),
    (1, 'Has reservado una sesión de Spinning para el 25 de febrero a las 18:00.', 'leido', '2025-02-22 12:30:00'),
    (1, 'Tu última sesión de entrenamiento fue registrada correctamente.', 'no leido', '2025-02-22 13:00:00'),
    (1, 'Recuerda completar tu evaluación física antes del 28 de febrero.', 'no leido', '2025-02-22 14:00:00'),

    -- 🔹 Notificaciones para Ana (cliente)
    (2, 'La sesión de Crossfit del 24 de febrero ha cambiado de horario a las 10:30 AM.', 'no leido', '2025-02-22 13:00:00'),
    (2, 'Has sido agregado a la lista de espera para la clase de Yoga.', 'leido', '2025-02-22 13:30:00'),
    (2, 'Tu pago de membresía ha sido procesado exitosamente.', 'no leido', '2025-02-22 14:00:00'),
    (2, 'Tu plan de entrenamiento ha sido actualizado por tu entrenador.', 'no leido', '2025-02-22 14:30:00'),

    -- 🔹 Notificaciones para Luis (entrenador)
    (3, 'Has sido asignado como entrenador de la nueva clase de HIIT los jueves.', 'leido', '2025-02-22 14:00:00'),
    (3, 'Un usuario ha solicitado una sesión personalizada contigo.', 'no leido', '2025-02-22 14:30:00'),
    (3, 'Recuerda confirmar tu disponibilidad para las clases del próximo mes.', 'no leido', '2025-02-22 15:00:00'),
    (3, 'Se ha agregado un nuevo ejercicio al plan de entrenamiento.', 'no leido', '2025-02-22 15:30:00'),

    -- 🔹 Notificaciones para Marta (administradora)
    (4, 'Se ha registrado un nuevo usuario en el sistema.', 'no leido', '2025-02-22 15:00:00'),
    (4, 'El sistema detectó una posible falla en el acceso de un usuario.', 'leido', '2025-02-22 15:30:00'),
    (4, 'Se ha generado un reporte de actividad reciente.', 'no leido', '2025-02-22 16:00:00'),
    (4, 'Se ha actualizado la base de datos de usuarios.', 'no leido', '2025-02-22 16:30:00'),

    -- 🔹 Notificaciones para Cristina (administradora)
    (5, 'Se ha realizado un nuevo pago de membresía.', 'no leido', '2025-02-22 16:00:00'),
    (5, 'Un usuario ha reportado un problema con la aplicación móvil.', 'leido', '2025-02-22 16:30:00'),
    (5, 'Revisión del sistema programada para el 26 de febrero.', 'no leido', '2025-02-22 17:00:00'),
    (5, 'Un nuevo informe de desempeño de entrenadores está disponible.', 'no leido', '2025-02-22 17:30:00');

	
    
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
        (1, 1, '2023-12-20', 'confirmada'),
        (2, 2, '2023-12-21', 'confirmada'),
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

