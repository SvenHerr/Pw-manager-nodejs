// This script runs on serverside

//dependencies required for the app
var connection = require('../PwTressor/database');
var encrypt1 = require('../PwTressor/encrypt');
const bcrypt = require('bcrypt');
const dateObject = new Date();
const dateLib = require('date-and-time');
var languageImport = require('../PwTressor/language');
const { redirect } = require("express/lib/response");

var language = languageImport.getEnglish();

// current date
const date = (`0 ${dateObject.getDate()}`).slice(-2);
// current month
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
// current year
const year = dateObject.getFullYear();

var userClass = require('../Pw-manager-nodejs/user');
const { conn } = require('./database');




function signUp(req, res) {

    var pw = req.body.pw;
    var pw1 = req.body.pw1;

    if (pw != pw1) {
        return "pw missmatch";
    }

    var hashedPw = encrypt1.hashPw(pw);
    if (hashedPw == null) {
        return "error: Pw hash problem!";
    }

    var id = getRandomInt(1, 10000).toString();
    var user = new userClass(id, req.body.username, req.body.surname, req.body.lastname, hashedPw, null);

    if (pw == null || pw1 == null) {
        return "error: Pw not found!";
    }

    if (user.username == null || user.surname == null || user.lastname == null) {
        return "error: User data not found!";
    }

    var userExists = connection.getUserExists(user.username);
    /*connection.query('SELECT Id FROM user WHERE user = ?', [user.username], function(err, complete) {
        if (complete != null) {
            userExists = true;
        }
    });*/

    if (userExists) {
        return "User already exists!";
    }

    var tempDate = new Date();
    tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');

    /*let query = `INSERT INTO user 
        (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);`;

    connection.query(query, [user.id, user.username, user.surname, user.lastname, tempDate, user.pw], function(err, complete) {

        if (err == null) {
            currentUser = user.username;
            req.session.pw = pw;
            user.loggedIn = true;
        } else {
            console.log("Db error: " + err);
            return "Db error! Talk to your admin";
        }
    });*/

    connection.addUser(user)

    return "ok";
};


function signIn(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/");
    }

    conn.getUser(req);
    /*
    connection.query('SELECT * FROM user WHERE Username = ?', [req.body.username], function(err, users) {
        currentDate = `${month}/${date}/${year}`;

        if (users != null) {
            if (users[0] != null) {
                if (this.user == null) {
                    this.user = new userClass();
                }
                this.user = new userClass(null, users[0].Username, users[0].Surname, users[0].Lastname, users[0].Pw);
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
    })*/
};

function logout(req, res) {
    req.session.loggedIn = false;
    req.session.username = "";
    req.session.surname = "";
    req.session.lastname = "";

    return res.redirect("/");
};

function getUserFromSession(req) {
    return new userClass(req.session.id, req.session.username, req.session.surname, req.session.lastname, null, req.session.loggedIn);
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { signUp, signIn, logout, getUserFromSession }