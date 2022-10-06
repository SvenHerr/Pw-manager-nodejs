// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/Database/database');
var encrypt1 = require('../Pw-manager-nodejs/crypto/encrypt');
const dateLib = require('date-and-time');
var User = require('../Pw-manager-nodejs/user');
var encrypt1 = require('../Pw-manager-nodejs/crypto/encrypt');
const bcrypt = require('bcrypt');
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
    // TODO: Autoincrement in mysql
    let id = helper.getRandomInt(1, 10000).toString();
    let user = new User(id, req.body.username, req.body.surname, req.body.lastname, hashedPw, null);

    if (pw === null || pw1 === null) {
        return "error: Pw not found!";
    }

    if (user.username === null || user.surname === null || user.lastname === null) {
        return "error: User data not found!";
    }

    try {
        let userExists = await connection.getUserExists(user.username);

        if(userExists){
            return "User already exists!";
        }

        let tempDate = new Date();
        tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');
    
        await connection.addUser(user);
        
        req.session.pw = user.pw;
        req.session.loggedIn = true;
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
        console.log("LoggedIn= " + req.session.loggedIn + "Username=" + req.session.username)
           

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
    req.session.username = "";
    req.session.surname = "";
    req.session.lastname = "";

    return res.redirect("/");
};



function setUserToSession(req, res, user) {
    console.log("in setUserToSession");
    let tempEncryptPW = encrypt1.hashPw(req.body.pw);

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


/** Gets the current user from the session
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns User object
 */
function getUserFromSession(req, res) {
    return new User(req.session.id, req.session.username, req.session.surname, req.session.lastname, null, req.session.loggedIn);
};



/** Change user pw(for login etc..)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
 async function changePw(req, res) {
    
    let complete = await connection.getAllPwFromUser(res);

    if (req.session.loggedIn) {
        if (complete !== null) {
            
            complete.forEach(row => async function(){

                try {

                    await connection.updatePwDatensatz(req);

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