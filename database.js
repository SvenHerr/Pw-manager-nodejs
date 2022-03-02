// This script runs on serverside

var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'nodetest',
    password: 'Start1234',
    database: 'test'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});
module.exports = conn;