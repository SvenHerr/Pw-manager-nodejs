// This script runs on serverside

var conn = require('../Pw-manager-nodejs/databaseConnection');
var userClass = require('../Pw-manager-nodejs/user');
const { encrypt, decrypt } = require('./crypto');
var escape = require('lodash.escape');
var helper = require('./helper');



function getUser(req) {

    return new Promise(function (resolve, reject) {

        conn.query('SELECT * FROM user WHERE Username = ?', [req.body.username], function (err, users) {
            console.log("in query");
            if (users != null) {
                if (users[0] != null) {
                    resolve(new userClass(null, users[0].Username, users[0].Surname, users[0].Lastname, users[0].Pw));
                }
            } else {
                console.log("reject");
                reject(null);
            }
        });
    });
}

function getUserExists(username) {
    return new Promise(function (resolve, reject) {
        conn.query('SELECT Id FROM user WHERE Username = ?', [username], function (err, complete) {
            if (complete != null) {
                resolve(true);
            }

            //resolve(false);
            reject(false);
        });
    });
}

function addUser(user) {
    return new Promise(function (resolve, reject) {
        let query = `INSERT INTO user (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);`;

        conn.query(query, [user.id, user.username, user.surname, user.lastname, helper.getCurrentDate(), user.pw], function (err, complete) {

            if (err == null) {
                resolve(new userClass(null, user.username, user.surname, user.lastname, user.pw));
            } else {
                console.log("Db error: " + err);
                reject(null);
            }
        });
    });
}

function getPw(req) {

}

function getDecriptedPw(req) {

    return new Promise(function (resolve, reject) {
        conn.query('SELECT * FROM pw WHERE Username =  ? AND Id = ?', [escape(req.session.username), escape(req.body.id)], (err, rows) => {

            if (err != null) {
                console.log("showpw sql error");
                reject(null);
            }

            if (rows[0] != null) {
                if (rows[0].Pw != null) {
                    resolve(decrypt(rows[0].Pw, escape(req.session.pw)))
                }
            }
        });
    });
}

function getPwList(req) {

}

function deletePw(id) {

    return new Promise(function (resolve, reject) {

        connection.query('DELETE FROM `pw` WHERE Id = ?', [id], function (err, complete) {
            if(err == null){
                reject(false);
            }else{
                resolve(true);
            }
        });
    });

}

function addPw(req) {

    return new Promise(function (resolve, reject) {
        var encryptedpw = encrypt(escape(req.body.pw), escape(req.session.pw));
        var applicationname = encrypt(escape(req.body.applicationname), escape(req.session.pw));
        var loginname = encrypt(req.body.loginname.toString(), req.session.pw.toString());

        conn.query('INSERT INTO `pw`(`Username`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)', [escape(req.session.username), applicationname, encryptedpw, loginname, helper.getCurrentDate(), Math.floor(Math.random() * 1000001).toString()], function (err, complete) {
            if (err != null) {
                reject(false);
                console.log("addnewpw db error: " + err);
            }
            console.log("in addPw");
            resolve(true);
        });
    });
}





module.exports = { conn, getUserExists, addUser, getUser, addPw, deletePw, getPw, getDecriptedPw };