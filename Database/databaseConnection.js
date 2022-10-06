// This script runs on serverside

var config = require('../config.json');
var mysql = require('mysql2/promise');

module.exports = async function () {
    var conn = await mysql.createConnection({
        host: 'localhost',
        user: config.username,
        password: config.password,
        database: 'nodepw1',
        debug: false
    });

    return conn;
};