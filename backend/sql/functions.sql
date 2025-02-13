-- 1. Calcular el número de asistentes a una sesión
DELIMITER //
CREATE OR REPLACE FUNCTION asistentes_en_sesion(p_id_sesion INT)
RETURNS INT
BEGIN
    DECLARE num_asistentes INT;
    SELECT COUNT(*) INTO num_asistentes
    FROM Reservas
    WHERE id_sesion = p_id_sesion
      AND estado = 'completada';
    RETURN num_asistentes;
END //
DELIMITER ;

-- 2. Verificar si un usuario tiene una reserva activa
DELIMITER //
CREATE OR REPLACE FUNCTION reserva_activa(p_id_usuario INT, p_id_sesion INT)
RETURNS BOOLEAN
BEGIN
    DECLARE existe_reserva BOOLEAN;
    SELECT COUNT(*) > 0 INTO existe_reserva
    FROM Reservas
    WHERE id_usuario = p_id_usuario
      AND id_sesion = p_id_sesion
      AND estado = 'pendiente';
    RETURN existe_reserva;
END //
DELIMITER ;

DELIMITER //

-- Función para obtener el tipo de membresía de un usuario
CREATE FUNCTION obtener_membresia(p_id_usuario INT)
RETURNS VARCHAR(50)
BEGIN
    DECLARE tipo_membresia VARCHAR(50);

    SELECT tipo_membresia INTO tipo_membresia
    FROM Membresias
    WHERE id_membresia = (SELECT id_membresia FROM Usuarios WHERE id_usuario = p_id_usuario);

    RETURN tipo_membresia;
END;
//

DELIMITER ;
