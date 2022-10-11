// This script runs on serverside

// dependencies required for the app
import { promisify } from "es6-promisify";
import escape from "lodash.escape";

import encrypt1 from "./crypto/encrypt.js";
import connection from "./Database/database.js";
import User from "./user.js";

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

    let user = new User(
        null,
        req.body.username,
        req.body.firstname,
        req.body.lastname,
        hashedPw,
        null
    );

    if (pw === null || pw1 === null) {
        return "error: Pw not found!";
    }

    if (
        user.username === null ||
        user.firstname === null ||
        user.lastname === null
    ) {
        return "error: User data not found!";
    }

    try {
        let userExists = await connection.getUserExists(user.username);

        if (userExists) {
            return "User already exists!";
        }

        await connection.insertUser(user);

        req.session.pw = user.pw;
        let save = promisify(req.session.save.bind(req.session));
        await save();

        return "ok";
    } catch (e) {
        return e;
    }
}

/**
 * signin user and store to session
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
            return res.render("login", { errormsg: req.t("loginError") });
        }

        setUserToSession(req, res, user);

        let save = promisify(req.session.save.bind(req.session));
        await save();

        res.redirect("/");
    } catch (err) {
        console.log("Error on singIn: " + err);
    }
}

/**
 * Logout the current user from the session
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function logout(req, res) {
    req.session.loggedIn = false;
    req.session.userid = 0;
    req.session.username = "";
    req.session.firstname = "";
    req.session.lastname = "";
    req.session.pw = "";

    let save = promisify(req.session.save.bind(req.session));
    await save();

    return res.redirect("/");
}

function setUserToSession(req, res, user) {
    let hastPw = encrypt1.hashPw(req.body.pw);

    if (hastPw === user.pw) {
        req.session.loggedIn = true;
        req.session.userid = user.id;
        req.session.username = user.username;
        req.session.firstname = user.firstname;
        req.session.lastname = user.lastname;
        req.session.pw = user.pw;
    } else {
        return res.render("login", { errormsg: req.t("loginError") });
    }
}

/**
 * Gets the current user from the session
 *
 * @param {*} req
 * @param {*} res
 * @returns User object
 */
function getUserFromSession(req) {
    return new User(
        req.session.userid,
        req.session.username,
        req.session.firstname,
        req.session.lastname,
        null,
        req.session.loggedIn
    );
}

/**
 * Change user pw(for login etc..)
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function changePw(req, res) {
    let pwList = await connection.getAllPwFromUser(res);

    if (req.session.loggedIn) {
        if (pwList !== null) {
            pwList.forEach(
                (row) =>
                    async function () {
                        try {
                            await connection.updatePwDatensatz(req, row);
                        } catch (err) {
                            console.log("ChangePW update sql: " + err);
                        }
                    }
            );
        }
    } else {
        return res.render("login", {
            errormsg: "Nach Pw Änderung bitte erneut anmelden",
        });
    }

    req.session.pw = escape(req.body.newPw);
    connection.updateUserPw(req);

    return res.render("login", { errormsg: req.t("loginErrorPwChange") });
}

export default {
    signUp,
    routes: { post: { logout, signIn, changePw } },
    getUserFromSession,
};
