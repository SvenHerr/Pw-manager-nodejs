// This script runs on serverside

var config = require('../config.json');
var mysql = require('mysql2/promise');

module.exports = async function () {
    var conn = await mysql.createConnection({
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.database,
        debug: false
    });

    return conn;
};