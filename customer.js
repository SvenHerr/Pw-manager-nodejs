// This script runs on serverside

//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const dateLib = require('date-and-time');
var connection = require('../PwTressor/database');
var encrypt1 = require('../PwTressor/encrypt');
const { encrypt, decrypt } = require('./crypto');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
var app = express();
const dateObject = new Date();
var languageImport = require('../PwTressor/language');
const { redirect } = require("express/lib/response");

var language = languageImport.getEnglish();

// current date
const date = (`0 ${dateObject.getDate()}`).slice(-2);
// current month
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
// current year
const year = dateObject.getFullYear();



// Why do i need extended false and not true?
//https://stackoverflow.com/questions/35931135/cannot-post-error-using-express
app.use(bodyParser.urlencoded({ extended: false }));
//app.use('/login', require('./login'))
app.set("view engine", "ejs");
//render css files
app.use(express.static("public"));


// What does it do? Do i need it?
app.post(function(req, res, next) {
    next();
});










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

    var tempDate = new Date();
    tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');
    var randomId = Math.random().toString();
    var user = new User(randomId,req.body.username,req.body.surname,req.body.lastname,tempDate,hashedPw,null);

    if (pw == null || pw1 == null) {
        return "error: Pw not found!";
    }

    if (user.username == null || user.surname == null || user.lastname == null) {
        return "error: User data not found!";
    }    

    var userExists = false;
    connection.query('SELECT Id FROM user WHERE User = ?', [user.username], function(err, complete) {
        if (complete != null) {
            userExists = true;
        }
    });

    if (userExists) {
        return "User already exists!";
    }    

    connection.query('INSERT INTO user VALUES(?,?,?,?,?,?)', [user.id, user.username, user.surname, user.lastname, tempDate, user.pw], function(err, complete) {

        if (err == null) {
            currentUser = user.username;
            currentUserPw = pw;
           
            user.loggedIn = true;
        } else {
            console.log("Db error: " + err);
            return "Db error! Talk to your admin";
        }
    });

    return "ok";
};


function signIn(req, res) {
    console.log("in signin");
    connection.query('SELECT * FROM user WHERE Username = ?', [req.body.username], function(err, users) {
        console.log("in signin db");
        currentDate = `${month}/${date}/${year}`;
        
        if (users != null) {
            if (users[0] != null) {

                user = new User(null,users[0].Username,users[0].Surname,users[0].Lastname,users[0].CreateDate,users[0].Pw);                
            }
        }
        console.log(user.username);

        if (users == null) {
            console.log("in return");
            return res.render("login", { errormsg: language.loginError });
        }

        if (users[0] == null) {
            console.log("in return");
            return res.render("login", { errormsg: language.loginError });
        }

        var tempEncryptPW = encrypt1.hashPw(req.body.pw)
        
        if (bcrypt.compare(tempEncryptPW,user.pw)) {

            user.username = req.body.username;
            currentUserPw = req.body.pw
            
            user.loggedIn = true;
            console.log("user.loggedIn: " + user.loggedIn);
            console.log("redirect to / (signIn)");
            res.redirect("/");

        } else {
            console.log("pw incorrect");
            return res.render("login", { errormsg: language.loginError });
        }
    })
};

function logout(req, res) {
    user.loggedIn = false;
    user = "";
    currentUserPw = "";
    return res.render("login", { errormsg: language.loggedOut });
};