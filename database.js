// This script runs on serverside

var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'nodetest',
    password: 'Start1234',
    database: 'nodepw1',
    debug: true
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});

function getUser(req, res) {

}

function addUser(req, res) {

}

function getPw(req, res) {

}

function addPw(req, res) {

}



module.exports = conn;