import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();  // Cargar las variables de entorno correspondientes

// Crear conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Función para ejecutar archivos SQL
const executeSql = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  await db.query(sql);
  console.log(`Archivo SQL ejecutado: ${filePath}`);
};

// Ejecutar tablas.sql y populate.sql
const migrate = async () => {
  try {
    console.log('Iniciando migraciones...');
    await executeSql(path.join(__dirname, 'tablas.sql'));
    await executeSql(path.join(__dirname, 'populate.sql'));
    console.log('Migraciones completadas.');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
  }
};

migrate();