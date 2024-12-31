-- 1. Validación de capacidad en las sesiones (RN-001)
DELIMITER //

CREATE OR REPLACE TRIGGER verificar_capacidad
BEFORE INSERT ON Reservas
FOR EACH ROW
BEGIN
    -- Declaración de variables
    DECLARE capacidad_actual INT;
    DECLARE capacidad_maxima INT;

    -- Calcular la capacidad actual de la sesión
    SELECT COUNT(*) INTO capacidad_actual
    FROM Reservas
    WHERE id_sesion = NEW.id_sesion;

    -- Obtener la capacidad máxima de la sesión
    SELECT capacidad_maxima INTO capacidad_maxima
    FROM Sesiones
    WHERE id_sesion = NEW.id_sesion;

    -- Verificar si la capacidad actual excede la máxima
    IF capacidad_actual >= capacidad_maxima THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Capacidad máxima alcanzada para esta sesión.';
    END IF;
END //

DELIMITER ;

-- 2. Validación de pagos (RN-008)
DELIMITER //
CREATE OR REPLACE TRIGGER validar_monto_pago
BEFORE INSERT ON Pagos
FOR EACH ROW
BEGIN
    IF NEW.monto <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El monto del pago debe ser mayor a 0.';
    END IF;
END //
DELIMITER ;

-- 3. Cancelación automática de reservas (RN-003)
DELIMITER //
CREATE OR REPLACE TRIGGER cancelar_reserva
BEFORE DELETE ON Reservas
FOR EACH ROW
BEGIN
    IF DATEDIFF(OLD.fecha_reserva, CURDATE()) < 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede cancelar reservas con menos de 24 horas de antelación.';
    END IF;
END //
DELIMITER ;