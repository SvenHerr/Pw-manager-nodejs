// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/database');
const dateObject = new Date();
var languageImport = require('../Pw-manager-nodejs/language');
const { encrypt, decrypt } = require('./crypto');
const dateLib = require('date-and-time');
const session = require('express-session');
var language = languageImport.getEnglish();
var escape = require('lodash.escape');

var encryptArray = [];


function addNewPw(req, res) {

    try {
        connection.addPw(req, res)
            .then(res.redirect("/"))
            .catch(function () {
                console.log("addnewpw err: " + err);
            });
    } catch (err) {
        console.log("addnewpw err: " + err);
    }
};

function deletePw(req, res) {

    try {
        if (req.body.confirmation == "yes") {
            connection.deletePw(req.body.elementI, res).then(function(value){
                res.redirect("/");
            }).catch(err){
                
            };
        }
    } catch (err) {
        console.log("deletePw err: " + err);
    }
};

function showPw(req, res) {

    if (encryptArray.includes(req.body.id)) {

        const index = encryptArray.indexOf(req.body.id);
        if (index > -1) {
            encryptArray.splice(index, 1);
        }

        res.send(escape("*****"));

    } else {
        encryptArray.push(req.body.id);

        const index = encryptArray.indexOf(req.body.id);

        var temp = encryptArray[index];

        if (temp != null) {

            return getDecriptedPw(req, res);

        } else {
            console.log("encryptArray on index is null");
        }
    }
};

function getDecriptedPw(req, res, pwcopycalled) {
    if (req.session.loggedIn) {

        connection.getDecriptedPw(req, res)
            .then(function (decryptedPw) {
                res.send(escape(decryptedPw));
            }).catch(function (err) {
                console.log("showpw: " + err);
            });
    }
}

function copyPw(req, res) {

    pwcopycalled = true;
    return getDecriptedPw(req, res, pwcopycalled);
};

function changePw(req, res) {
    var oldPw = escape(req.body.oldPw);
    var newPw = escape(req.body.newPw);

    connection.query('SELECT * FROM pw WHERE User =  ?', [req.session.username], function (err, complete) {

        if (req.session.loggedIn) {
            if (complete != null) {
                complete.forEach(row => {

                    var decriptedName = decrypt(row.Name, oldPw);
                    var encriptedName = encrypt(decriptedName, newPw);
                    var decriptedPw = decrypt(row.Pw, oldPw);
                    var encriptedPw = encrypt(decriptedPw, newPw);

                    try {
                        connection.query('UPDATE pw SET Name = ?, Pw = ? WHERE Id = ?', [encriptedName, encriptedPw, row.Id]);
                    } catch (err) {
                        console.log("ChangePW update sql: " + err);
                    }
                });
            }
        } else {
            return res.render("login", { errormsg: "Nach Pw Änderung bitte erneut anmelden" });
        }
    });

    req.session.pw = newPw;
    connection.query('UPDATE user SET Pw = ? WHERE Username = ?', [newPw, req.session.username]);

    return res.render("login", { errormsg: language.loginErrorPwChange });
};

function changePwApp(req, res) {
    var newPw = escape(req.body.newPw);
    var newPwConfirmation = escape(req.body.newPw1);
    var id = escape(req.body.changeelement);

    if (newPw != newPwConfirmation) {
        return language.pwMissmatch;
    }

    if (id == null) {
        return language.idIsNotDefined;
    }

    var currentDate = new Date();
    currentDate = dateLib.format(currentDate, 'YYYY-MM-DD');

    if (req.session.loggedIn) {

        var encriptedPw = encrypt(newPw, req.session.pw);

        try {
            connection.query('UPDATE pw SET Pw = ?, CreateDate = ? WHERE Id = ?', [encriptedPw, currentDate, id]);
        } catch (err) {
            console.log("ChangePW update sql: " + err);
        }

    } else {
        console.log("ChangePW else!");
    }
    console.log("redirect to / (changePwApp)");
    res.redirect("/");
};

module.exports = { changePwApp, changePw, copyPw, showPw, deletePw, addNewPw }