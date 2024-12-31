import { createPool } from 'mysql2';

// Configuración de la conexión
const pool = createPool({
    host: 'localhost',           // Cambia si usas otro host
    port: 3306,
    user: 'root',                // Usuario de tu base de datos
    password: 'root',   // Contraseña del usuario
    database: 'app_gym',         // Nombre de la base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportar la conexión
const db = pool.promise(); // Esto permite usar async/await con las consultas
export default db;
