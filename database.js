// This script runs on serverside

var conn = require('./databaseConnection');
var userClass = require('../Pw-manager-nodejs/user');
const { encrypt, decrypt } = require('./crypto');
var escape = require('lodash.escape');
var helper = require('./helper');

let connection = null;

async function query(sql, params) {
    if (connection === null) {
        connection = await conn();
    }

    let [rows] = await connection.query(sql, params);

    return rows;
}

async function getUser(req) {

    let rows = await query('SELECT * FROM user WHERE Username = ?', [req.body.username]);
    
    if (rows !== null) {
        if (rows.length > 0 ) {
            return new userClass(null, rows[0].Username, rows[0].Surname, rows[0].Lastname, rows[0].Pw);
        }
    } else {
        console.log("reject");
        return null;
    }
}

async function getUserExists(username) {

    let rows = await query('SELECT Id FROM user WHERE Username = ?', [username]);

    return rows.length > 0;
}

async function addUser(user) {
    
    await query('INSERT INTO user (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);', 
    [user.id, user.username, user.surname, user.lastname, helper.getCurrentDate(), user.pw]);

}

async function updateUserPw(req){

    var newPw = escape(req.body.newPw);
    await query('UPDATE user SET Pw = ? WHERE Username = ?', [newPw, req.session.username]);
    
}


async function updatePwById(req) {

    var id = escape(req.body.changeelement);
    var newPw = escape(req.body.newPw);
    var encriptedPw = encrypt(newPw, req.session.pw);

    await query('UPDATE pw SET Pw = ?, CreateDate = ? WHERE Id = ?', [encriptedPw, helper.getCurrentDate(), id]);

}

async function getDecriptedPw(req) {

    let rows = await query('SELECT * FROM pw WHERE Username =  ? AND Id = ?', [escape(req.session.username), escape(req.body.id)]);

    if(rows === null){
        // return
    }
    if(rows.length === 0){
        // return
    }

    if (rows[0].Pw != null) {
        return decrypt(rows[0].Pw, escape(req.session.pw));
    }

}

async function getAllPwFromUser(req) {

    let rows = await query('SELECT * FROM pw WHERE Username =  ?', [req.session.username]);

    return rows;
    
}

async function getPw(req) { 

}

async function deletePw(id) {

    await query('DELETE FROM `pw` WHERE Id = ?', [id], function (err){
        if(err === null){
            return true;
        }else{
            return err;
        }
    });
    
}

async function addPw(req) {

    await query('INSERT INTO `pw`(`Username`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)', [escape(req.session.username), applicationname, encryptedpw, loginname, helper.getCurrentDate(), Math.floor(Math.random() * 1000001).toString()], function (err){
        if(err === null){
            return true;
        }else{
            return err;
        }
    });

}


module.exports = { conn, getUserExists, addUser, getUser, addPw, deletePw, getPw, getDecriptedPw,updatePwById,getAllPwFromUser,updateUserPw };