// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/database');
var encrypt1 = require('../Pw-manager-nodejs/encrypt');
const dateLib = require('date-and-time');
var userClass = require('../Pw-manager-nodejs/user');
var encrypt1 = require('../Pw-manager-nodejs/encrypt');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('./crypto');



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

    var userExists = connection.getUserExists(req, res, user.username);

    if (userExists) {
        return "User already exists!";
    }

    var tempDate = new Date();
    tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');

    connection.addUser(user)
    .then(function(user){
        req.session.pw = user.pw;
        req.session.loggedIn = true;
        return "ok";

    }).catch(function(err) {
        console.log('Caught an error!', err);
    });

    return "ok";
};

function setUserToSession(req, res, user) {
    console.log("in setUserToSession");
    var tempEncryptPW = encrypt1.hashPw(req.body.pw);

    if (bcrypt.compare(tempEncryptPW, user.pw)) {
        req.session.loggedIn = true;
        req.session.id = user.id;
        req.session.username = user.username;
        req.session.surname = user.surname;
        req.session.lastname = user.lastname;
        req.session.pw = user.pw;

    } else {
        return res.render("login", { errormsg: language.loginError });
    }
}


function signIn(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/");
    }

    try {
        
        connection.getUser(req, res)
            .then(function (user) {
                setUserToSession(req, res, user);

                if (user == null) {
                    return res.render("login", { errormsg: language.loginError });
                }

                res.redirect("/");
                console.log("LoggedIn= " + req.session.loggedIn + "Username=" + req.session.username)
            })
            .catch(function(err) {
                console.log('Caught an error!', err);
            });

    } catch (err) {
        console.log("Error on singIn: " + err);
    }
};

function logout(req, res) {
    req.session.loggedIn = false;
    req.session.username = "";
    req.session.surname = "";
    req.session.lastname = "";

    return res.redirect("/");
};

function getUserFromSession(req, res) {
    return new userClass(req.session.id, req.session.username, req.session.surname, req.session.lastname, null, req.session.loggedIn);
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { signUp, signIn, logout, getUserFromSession }