const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Función para obtener la IP pública
const getPublicIP = async () => {
    try {
        const response = await axios.get('http://checkip.amazonaws.com');
        return response.data.trim(); // Retorna la IP pública
    } catch (error) {
        console.error('Error al obtener la IP pública:', error);
        return null;
    }
};

// Función para actualizar el archivo config.js con la nueva IP
const updateConfig = (ip) => {
    const configPath = path.join(__dirname, 'src/config.js'); // Ruta al archivo de configuración

    // Leer el archivo config.js
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de configuración:', err);
            return;
        }

        // Reemplazar la IP antigua con la nueva
        const updatedData = data.replace(/const API_URL = 'http:\/\/.*:3000';/, `const API_URL = 'http://${ip}:3000';`);

        // Escribir el archivo actualizado
        fs.writeFile(configPath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Error al escribir el archivo de configuración:', err);
            } else {
                console.log('Archivo de configuración actualizado con la nueva IP:', ip);
            }
        });
    });
};

// Ejecutar el script
(async () => {
    const ip = await getPublicIP();
    if (ip) {
        updateConfig(ip);
    } else {
        console.log('No se pudo obtener la IP pública.');
    }
})();
