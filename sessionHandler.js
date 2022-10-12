import encrypt1 from './crypto/encrypt.js';
import { promisify } from 'es6-promisify';
import escape from 'lodash.escape';

/**
 * Set user data to session
 * @param {*} req 
 * @param {*} res 
 * @param {*} user 
 * @returns 
 */
async function setUserToSession(req, res, user) {
    let hastPw = encrypt1.hashPw(req.body.pw);

    if (hastPw === user.pw) {
        req.session.loggedIn = true;
        req.session.userid = user.id;
        req.session.username = user.username;
        req.session.firstname = user.firstname;
        req.session.lastname = user.lastname;
        req.session.pw = user.pw;

        await saveSession(req);
    } else {
        throw new Error('Pw missmatch!');    
    }
}

/** Delte user data from session
 * 
 * @param {*} req 
 */
async function deleteUserFromSession(req) {
    req.session.loggedIn = false;
    req.session.userid = 0;
    req.session.username = '';
    req.session.firstname = '';
    req.session.lastname = '';
    req.session.pw = '';

    await saveSession(req);
}

/** Regenerate session
 * 
 * @param {*} req 
 */
async function regenerateSession(req) {
    let regeneratedSession = promisify(req.session.regenerate.bind(req.session));
    await regeneratedSession();
    await saveSession(req);
}

/** Update pw from session
 * 
 * @param {*} req 
 */
async function updteUserPwFromSession(req) {
    req.session.pw = escape(req.body.newPw);
    await saveSession(req);
}

/** Save session
 * 
 * @param {*} req 
 */
async function saveSession(req){
    let save = promisify(req.session.save.bind(req.session));
    await save();
}

export default {
    setUserToSession,
    deleteUserFromSession,
    updteUserPwFromSession,
    regenerateSession
};
