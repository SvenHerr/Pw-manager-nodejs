// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/database');
var encrypt1 = require('../Pw-manager-nodejs/encrypt');
const dateLib = require('date-and-time');
var userClass = require('../Pw-manager-nodejs/user');



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

    var userExists = connection.getUserExists(req,res,user.username);

    if (userExists) {
        return "User already exists!";
    }

    var tempDate = new Date();
    tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');

    connection.addUser(user)

    return "ok";
};


function signIn(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/");
    }

    try{
        console.log("vor getuser");
        connection.getUser(req,res);
        console.log("nach getuser");
        console.log("LoggedIn= " +req.session.loggedIn + "Username=" + req.session.username)
    }catch (err){
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

function getUserFromSession(req,res) {
    return new userClass(req.session.id, req.session.username, req.session.surname, req.session.lastname, null, req.session.loggedIn);
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { signUp, signIn, logout, getUserFromSession }