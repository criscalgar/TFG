import fs from 'fs';
import os from 'os';
import path from 'path';

// Obtener la IP local automáticamente
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
console.log('📡 IP detectada en el sistema:', localIP);

// Archivos donde reemplazar cualquier IP
const archivos = [
  './backend/.env',
  './backend/src/index.js',
  './my-app/src/config.js',
];

// Expresión regular para detectar cualquier IP IPv4
const regex = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;

// Reemplazo de IP en cada archivo
archivos.forEach(file => {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (regex.test(content)) {
      content = content.replace(regex, localIP);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ IP actualizada en: ${file}`);
    } else {
      console.log(`ℹ️ No se encontró ninguna IP que actualizar en: ${file}`);
    }
  } else {
    console.warn(`⚠️ Archivo no encontrado: ${file}`);
  }
});
