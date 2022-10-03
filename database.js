// This script runs on serverside

var conn = require('../Pw-manager-nodejs/databaseConnection');
const dateObject = new Date();
const dateLib = require('date-and-time');
const date = (`0 ${dateObject.getDate()}`).slice(-2);
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
const year = dateObject.getFullYear();
var languageImport = require('../Pw-manager-nodejs/language');
var language = languageImport.getEnglish();
var userClass = require('../Pw-manager-nodejs/user');
var encrypt1 = require('../Pw-manager-nodejs/encrypt');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('./crypto');



function getUser(req,res) {
    console.log("GetUser Username= " + req.body.username);
    conn.query('SELECT * FROM user WHERE Username = ?', [req.body.username], function(err, users) {
        currentDate = `${month}/${date}/${year}`;

        if (users != null) {
            if (users[0] != null) {
                if (this.user == null) {
                    this.user = new userClass();
                }
                this.user = new userClass(null, users[0].Username, users[0].Surname, users[0].Lastname, users[0].Pw);
                console.log(this.user.username);
            }
        }

        if (users == null || users[0] == null) {
            return res.render("login", { errormsg: language.loginError });
        }

        var tempEncryptPW = encrypt1.hashPw(req.body.pw);

        if (bcrypt.compare(tempEncryptPW, this.user.pw)) {
            req.session.loggedIn = true;
            req.session.id = this.user.id;
            req.session.username = this.user.username;
            req.session.surname = this.user.surname;
            req.session.lastname = this.user.lastname;
            req.session.pw = this.user.pw;

            res.redirect("/");

        } else {
            return res.render("login", { errormsg: language.loginError });
        }
    })
}

function getUserExists(req,res,username) {
    conn.query('SELECT Id FROM user WHERE Username = ?', [username], function(err, complete) {
        if (complete != null) {
            return true;
        }

        return false;
    });
}

function addUser(user) {
    let query = `INSERT INTO user 
    (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);`;

    

    conn.query(query, [user.id, user.username, user.surname, user.lastname, getCurrentDate(), user.pw], function(err, complete) {

        if (err == null) {
            currentUser = user.username;
            req.session.pw = pw;
            user.loggedIn = true;
        } else {
            console.log("Db error: " + err);
            return "Db error! Talk to your admin";
        }
    });
}

function getPw(req, res) {

}

function getPwList(req, res) {

}

function deletePw(id, res) {
    connection.query('DELETE FROM `pw` WHERE Id = ?', [id], function(err, complete) {
        res.redirect("/");
    })
}

function addPw(req, res) {

    var encryptedpw = encrypt(req.body.pw, req.session.pw);
    var applicationname = encrypt(req.body.applicationname, req.session.pw);
    var loginname = encrypt(req.body.loginname, req.session.pw);

    conn.query('INSERT INTO `pw`(`Username`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)', [req.session.username, applicationname, encryptedpw, loginname, getCurrentDate(), Math.floor(Math.random() * 1000001).toString()], function(err, complete) {
        if (err != null) {
            console.log("addnewpw db error: " + err);
        }

        res.redirect("/");
    })
}

function getCurrentDate(){
    var tempDate = new Date();
    return dateLib.format(tempDate, 'YYYY-MM-DD');    
}



module.exports = { conn, getUserExists, addUser, getUser,addPw,deletePw, getPw };