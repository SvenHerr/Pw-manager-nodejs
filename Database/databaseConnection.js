// This script runs on serverside

var mysql = require('mysql2/promise');

module.exports = async function () {
    var conn = await mysql.createConnection({
        host: process.env.DB_SERVER,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        debug: false
    });

    return conn;
};
