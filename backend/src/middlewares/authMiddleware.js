import jwt from 'jsonwebtoken';

//Middleware actúa como un "puente" entre la solicitud del cliente (por ejemplo, un navegador o Postman) y la respuesta del servidor.

/* Cada solicitud antes de llegar a su destino. Por ejemplo:

Un cliente realiza una solicitud a /auth/login.
Antes de que el servidor procese esa solicitud, un middleware puede:
Verificar si el cliente está autenticado.
Registrar información sobre la solicitud (logs).
Añadir datos adicionales a la solicitud.
*/

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó un token' });
    }

    try {
        // Extraer el token de la cadena 'Bearer <token>'
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded; // Almacena los datos del usuario en la solicitud
        next(); // Continúa al siguiente middleware o controlador
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para verificar que el usuario tiene un rol permitido
export const checkRole = (rolesPermitidos) => (req, res, next) => {
    const { tipo_usuario } = req.user;

    // Verifica si el tipo de usuario está en los roles permitidos
    if (!rolesPermitidos.includes(tipo_usuario)) {
        return res.status(403).json({ error: 'Permiso denegado: no tienes acceso a esta funcionalidad' });
    }
    next(); // Continúa si el usuario tiene el rol adecuado
};
