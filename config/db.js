const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const serverName = process.env.DB_SERVER || 'SAITEJA';
const dbName = process.env.DB_NAME || 'sai_automobiles_db';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

let poolConfig;

if (process.env.DB_CONNECTION_STRING) {
    poolConfig = {
        connectionString: process.env.DB_CONNECTION_STRING,
        parseJSON: true,
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
    };
} else if (dbUser && dbPassword) {
    // Production standard SQL Server authentication configuration
    poolConfig = {
        user: dbUser,
        password: dbPassword,
        server: serverName,
        database: dbName,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true
        },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
    };
} else {
    // Local development Windows Authentication (msnodesqlv8 + ODBC Driver 17)
    const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
    poolConfig = {
        connectionString: connectionString,
        parseJSON: true,
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
    };
}

const poolPromise = new sql.ConnectionPool(poolConfig)
    .connect()
    .then(pool => {
        console.log('===========================================================');
        console.log(' Successfully Connected to SQL Server Database');
        console.log(' Server   : ' + serverName);
        console.log(' Database : ' + dbName);
        console.log(' Auth     : ' + (dbUser ? 'SQL Server Auth' : 'Windows Authentication (ODBC 17)'));
        console.log('===========================================================');
        return pool;
    })
    .catch(err => {
        console.error('===========================================================');
        console.error(' FATAL: SQL SERVER CONNECTION FAILED!');
        console.error(' Server   : ' + serverName);
        console.error(' Database : ' + dbName);
        console.error(' Error    : ' + err.message);
        console.error(' Please ensure SQL Server is running and database exists.');
        console.error('===========================================================');
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
