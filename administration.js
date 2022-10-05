// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/database');
var languageImport = require('../Pw-manager-nodejs/language');
const { encrypt, decrypt } = require('./crypto');
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
            console.log("in delete");
            console.log("in delete elementId" + req.body.elementId);
            connection.deletePw(req.body.elementId)
            .then(function(value){
                res.redirect("/");
            })
            .catch(function (err) {
                console.log(err);
            });
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

/**
 * Changes pw from User (for login etc..)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function changePw(req, res) {
    var oldPw = escape(req.body.oldPw);
    var newPw = escape(req.body.newPw);

    //await connection.getAllPwFromUser(res);
    connection.query('SELECT * FROM pw WHERE Username =  ?', [req.session.username], function (err, complete) {

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
    //connection.updateUserPw(req);

    return res.render("login", { errormsg: language.loginErrorPwChange });
};

/**
 * Changes the pw from row
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

    if (req.session.loggedIn) {

        try {
            connection.updatePwById(req)
            .then(function (){
                console.log("redirect to / (changePwApp)");
                res.redirect("/");
            })
            .catch(function (err) {
                console.log("ChangePW update sql: " + err);
            });;
        } catch (err) {
            console.log("ChangePW update sql: " + err);
        }

    } else {
        console.log("ChangePW else!");
    }
};

module.exports = { changePwApp, changePw, copyPw, showPw, deletePw, addNewPw }