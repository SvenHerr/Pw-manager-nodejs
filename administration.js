// This script runs on serverside

//dependencies required for the app
var connection = require('../PwTressor/database');

const dateObject = new Date();
var languageImport = require('../PwTressor/language');
const { encrypt, decrypt } = require('./crypto');
const dateLib = require('date-and-time');
const session = require('express-session');
var language = languageImport.getEnglish();

// current date
const date = (`0 ${dateObject.getDate()}`).slice(-2);
// current month
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
// current year
const year = dateObject.getFullYear();

var encryptArray = [];


function addNewPw(req, res) {

    try {
        var encryptedpw = encrypt(req.body.pw, req.session.pw);
        var tempDate = new Date();
        tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');
        var applicationname = encrypt(req.body.applicationname, req.session.pw);
        var loginname = encrypt(req.body.loginname, req.session.pw);

        connection.query('INSERT INTO `pw`(`User`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)', [req.session.username, applicationname, encryptedpw, loginname, tempDate, Math.floor(Math.random() * 1000001).toString()], function(err, complete) {
            if (err != null) {
                console.log("addnewpw db error: " + err);
            }

            res.redirect("/");
        })
    } catch (err) {
        console.log("addnewpw err: " + err);
    }
};

function deletePw(req, res) {
    var id = req.body.elementId;
    var confirmation = req.body.confirmation;

    if (confirmation == "yes") {
        connection.query('DELETE FROM `pw` WHERE Id = ?', [id], function(err, complete) {
            res.redirect("/");
        })
    }
};

function showPw(req, res) {
    var decryptedPw = "";

    if (encryptArray.includes(req.body.id)) {

        const index = encryptArray.indexOf(req.body.id);
        if (index > -1) {
            encryptArray.splice(index, 1);
        }

        res.send("*****");

    } else {
        encryptArray.push(req.body.id);

        const index = encryptArray.indexOf(req.body.id);

        var temp = encryptArray[index];

        if (temp != null) {
            connection.query('SELECT * FROM pw WHERE User =  ? AND Id = ?', [req.session.username, req.body.id], (err, rows) => {

                if (err != null) {
                    console.log("showpw sql error");
                }

                if (rows[0] != null) {
                    if (rows[0].Pw != null) {
                        decryptedPw = decrypt(rows[0].Pw, req.session.pw);
                        res.send(decryptedPw);
                    }
                }
            });

        } else {
            console.log("encryptArray on index is null");
        }
    }
};

function copyPw(req, res) {
    pwcopycalled = true;
    if (req.session.loggedIn) {
        connection.query('SELECT Pw FROM pw WHERE Id =  ?', [req.body.id], function(err, rows) {

            if (rows[0] != null) {
                encryptedPwCopy = decrypt(rows[0].Pw, req.session.pw);
                res.send(encryptedPwCopy);
            } else {
                res.send("error");
            }
        });
    }
};

function changePw(req, res) {
    var oldPw = req.body.oldPw;
    var newPw = req.body.newPw;

    connection.query('SELECT * FROM pw WHERE User =  ?', [req.session.username], function(err, complete) {
        currentDate = `${month}/${date}/${year}`;

        if (req.session.loggedIn) {
            if (complete != null) {
                complete.forEach(row => {

                    var decriptedName = decrypt(row.Name.toString(), oldPw.toString());
                    var encriptedName = encrypt(decriptedName.toString(), newPw.toString());
                    var decriptedPw = decrypt(row.Pw.toString(), oldPw.toString());
                    var encriptedPw = encrypt(decriptedPw.toString(), newPw.toString());

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
    var newPw = req.body.newPw;
    var newPwConfirmation = req.body.newPw1;
    var id = req.body.changeelement;

    if (newPw != newPwConfirmation) {
        return language.pwMissmatch;
    }

    if (id == null) {
        return language.idIsNotDefined;
    }

    var currentDate = new Date();
    currentDate = dateLib.format(currentDate, 'YYYY-MM-DD');

    if (req.session.loggedIn) {

        var encriptedPw = encrypt(newPw.toString(), req.session.pw);

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