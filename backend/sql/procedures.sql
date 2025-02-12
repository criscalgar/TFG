DELIMITER //
CREATE OR REPLACE PROCEDURE asignar_entrenador_a_sesion (p_id_sesion INT, p_id_entrenador INT)
BEGIN
	DECLARE conflictos INT;    
    -- Selecciona el número de conflictos para el entrenador
   SELECT COUNT(*) INTO conflictos
   FROM Sesiones
   WHERE id_trabajador = p_id_entrenador AND fecha = (SELECT fecha FROM Sesiones WHERE id_sesion = p_id_sesion) AND 
		(hora_inicio < (SELECT hora_fin FROM Sesiones WHERE id_sesion = p_id_sesion) AND 
		 hora_fin > (SELECT hora_inicio FROM Sesiones WHERE id_sesion = p_id_sesion));

    -- Si hay conflictos, lanza un error
    IF conflictos > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El entrenador ya está asignado a otra sesión en el mismo horario.';
    ELSE
        -- Actualiza la sesión para asignar al entrenador
        UPDATE Sesiones
        SET id_trabajador = p_id_entrenador
        WHERE id_sesion = p_id_sesion;
    END IF;
END //
DELIMITER ;


-- 2. Registrar un turno de trabajo (RN-004)
DELIMITER //
CREATE OR REPLACE PROCEDURE registrar_turno (p_id_trabajador INT, p_fecha DATE, p_hora_entrada TIME, p_hora_salida TIME)
BEGIN
    INSERT INTO Registros_Turnos (id_trabajador, fecha, hora_entrada, hora_salida)
    VALUES (p_id_trabajador, p_fecha, p_hora_entrada, p_hora_salida);
END //
DELIMITER ;

DELIMITER //

-- Procedimiento para asignar una membresía a un usuario
CREATE PROCEDURE asignar_membresia (
    IN p_id_usuario INT,
    IN p_id_membresia INT
)
BEGIN
    UPDATE Usuarios
    SET id_membresia = p_id_membresia
    WHERE id_usuario = p_id_usuario;
END;
//

DELIMITER ;
