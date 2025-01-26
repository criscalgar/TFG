import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: '192.168.1.101',
    user: 'root',
    password: 'root',
    database: 'app_gym',
    port: 3306,
    authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').auth({}),
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;
