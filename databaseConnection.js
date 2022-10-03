// This script runs on serverside


var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'nodetest',
    password: 'Start1234',
    database: 'nodepw1',
    debug: false
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});




module.exports = conn;