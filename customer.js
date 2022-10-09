// This script runs on serverside

//dependencies required for the app
var connection = require('./Database/database');
var encrypt1 = require('./crypto/encrypt');
var User = require('./user');
var encrypt1 = require('./crypto/encrypt');
const bcrypt = require('bcrypt');
var languageImport = require('./language');
var language = languageImport.getEnglish();
var escape = require('lodash.escape');



async function signUp(req) {

    let pw = req.body.pw;
    let pw1 = req.body.pw1;

    if (pw !== pw1) {
        return "pw missmatch";
    }

    let hashedPw = encrypt1.hashPw(pw);
    if (hashedPw === null) {
        return "error: Pw hash problem!";
    }

    let user = new User(null, req.body.username, req.body.firstname, req.body.lastname, hashedPw, null);

    if (pw === null || pw1 === null) {
        return "error: Pw not found!";
    }

    if (user.username === null || user.firstname === null || user.lastname === null) {
        return "error: User data not found!";
    }

    try {
        let userExists = await connection.getUserExists(user.username);

        if(userExists){
            return "User already exists!";
        }

        await connection.insertUser(user);

        req.session.pw = user.pw;
        //req.session.loggedIn = true;

        return "ok";
    } catch (e) {
        return e;
    }
};



/** signin user and store to session
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function signIn(req, res) {

    if (req.session.loggedIn) {
        res.redirect("/");
    }

    try {

        let user = await connection.getUser(req, res);

        if (user === null) {
            return res.render("login", { errormsg: language.loginError });
        }

        setUserToSession(req, res, user);

        res.redirect("/");

    } catch (err) {
        console.log("Error on singIn: " + err);
    }
};



/** Logout the current user from the session
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
function logout(req, res) {

    req.session.loggedIn = false;
        req.session.id = 0
        req.session.username = "";
        req.session.firstname = "";
        req.session.lastname = "";
        req.session.pw = "";

    return res.redirect("/");
};



function setUserToSession(req, res, user) {
    let hastPw = encrypt1.hashPw(req.body.pw);

    if ( hastPw === user.pw) {
        req.session.loggedIn = true;
        req.session.id = user.id;
        req.session.username = user.username;
        req.session.firstname = user.firstname;
        req.session.lastname = user.lastname;
        req.session.pw = user.pw;

    } else {
        return res.render("login", { errormsg: language.loginError });
    }
}


/** Gets the current user from the session
 *
 * @param {*} req
 * @param {*} res
 * @returns User object
 */
function getUserFromSession(req) {
    return new User(req.session.id, req.session.username, req.session.firstname, req.session.lastname, null, req.session.loggedIn);
};



/** Change user pw(for login etc..)
 * @param {*} req
 * @param {*} res
 * @returns
 */
 async function changePw(req, res) {

    let pwList = await connection.getAllPwFromUser(res);

    if (req.session.loggedIn) {
        if (pwList !== null) {

            pwList.forEach(row => async function(){

                try {

                    await connection.updatePwDatensatz(req,row);

                } catch (err) {

                    console.log("ChangePW update sql: " + err);
                }
            });
        }
    } else {

        return res.render("login", { errormsg: "Nach Pw Änderung bitte erneut anmelden" });

    }

    req.session.pw = escape(req.body.newPw);
    connection.updateUserPw(req);

    return res.render("login", { errormsg: language.loginErrorPwChange });
};


module.exports = { signUp, signIn, logout, getUserFromSession, changePw }
