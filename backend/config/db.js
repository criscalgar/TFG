import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,  // Usamos la variable de entorno DB_HOST para la base de datos
    user: process.env.DB_USER,  // Usamos la variable de entorno DB_USER
    password: process.env.DB_PASSWORD,  // Usamos la variable de entorno DB_PASSWORD
    database: process.env.DB_NAME,  // Usamos la variable de entorno DB_NAME
    port: process.env.DB_PORT,  // Usamos la variable de entorno DB_PORT
    authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').auth({}),
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;
