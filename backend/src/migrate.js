import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();  // Cargar las variables de entorno

const db = mysql.createPool({
    host: process.env.DB_HOST,        // Usar las variables de entorno
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Ruta a los archivos SQL
const tablesSql = path.join(__dirname, '../../sql/tablas.sql');  // Reemplaza con la ruta correcta
const populateSql = path.join(__dirname, '../../sql/populate.sql');  // Reemplaza con la ruta correcta

// Función para leer y ejecutar los scripts SQL
const executeSql = async (filePath) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    await db.query(sql);
    console.log(`Archivo SQL ejecutado: ${filePath}`);
};

// Ejecutar ambos archivos SQL
const migrate = async () => {
    try {
        console.log('Iniciando migraciones...');
        await executeSql(tablesSql);  // Ejecutar tables.sql
        await executeSql(populateSql);  // Ejecutar populate.sql
        console.log('Migraciones completadas.');
    } catch (error) {
        console.error('Error al ejecutar las migraciones:', error);
    }
};

migrate();