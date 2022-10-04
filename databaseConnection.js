// This script runs on serverside

var config = require('./config.json');

var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: config.username,
    password: config.pw,
    database: 'nodepw1',
    debug: false
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});




module.exports = conn;