// This script runs on serverside

// dependencies required for the app
import encrypt1 from './crypto/encrypt.js';
import connection from './Database/database.js';
import sessionHandler from './sessionHandler.js';
import User from './user.js';

/**
 * Sign up a new user
 *
 * @param {*} req
 * @returns
 */
async function signUp(req) {
  let pw = req.body.pw;
  let pw1 = req.body.pw1;

  if (pw === null || pw1 === null) {
    sessionHandler.setErrormsgToSession(req, 'signup.pwNotFound');
    return false;
  }

  if (pw !== pw1) {
    sessionHandler.setErrormsgToSession(req, 'signup.pwMissmage');
    return false;
  }

  let hashedPw = encrypt1.hashPw(pw);
  if (hashedPw === null) {
    sessionHandler.setErrormsgToSession(req, 'signup.pwHashProblem');
    return false;
  }

  let user = new User(null, req.body.username, req.body.firstname,
                      req.body.lastname, hashedPw, null);

  if (user.username === null || user.firstname === null ||
      user.lastname === null) {
    sessionHandler.setErrormsgToSession(req, 'signup.pwHashProblem');
    return false;
  }

  try {
    if (await connection.getUserExists(user.username)) {
      sessionHandler.setErrormsgToSession(req, 'signup.userAlreadyExists');
      return false;
    }
  } catch (err) {
    console.log('Error on signUp: ' + err);
    return err;
  }

  try {
    await connection.insertUser(user);
  } catch (err) {
    return err;
  }

  await sessionHandler.updteUserPwFromSession(req.session.pw);

  return true;
}

/**
 * Signin user and store to session
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function signIn(req, res) {
  if (req.session.loggedIn) {
    res.redirect('/');
  }

  try {
    let user = await connection.getUser(req, res);

    if (user === null) {
      return res.render('login', {errormsg : req.t('login.generalError')});
    }

    try {
      if (user.pw === encrypt1.hashPw(req.body.pw)) {
        await sessionHandler.setUserToSession(req, res, user);
      }
    } catch (err) {
      return res.render('login', {errormsg : req.t('loginError')});
    }

    res.redirect('/');
  } catch (err) {
    console.log('Error on singIn: ' + err);
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
  try {
    // Save default user data to session
    await sessionHandler.deleteUserFromSession(req);
  } catch (err) {
    console.log('Error on logout: ' + err);
  }

  try {
    // Regenerate new session
    await sessionHandler.regenerateSession(req);
  } catch (err) {
    console.log('Error on logout: ' + err);
  }

  return res.redirect('/');
}

/**
 * Gets the current user from the session
 *
 * @param {*} req
 * @param {*} res
 * @returns User object
 */
function getUserFromSession(req) {
  return new User(req.session.userid, req.session.username,
                  req.session.firstname, req.session.lastname, null,
                  req.session.loggedIn);
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
      pwList.forEach(row => async function() {
        try {
          await connection.updatePwDatensatz(req, row);
        } catch (err) {
          console.log('ChangePW update sql: ' + err);
        }
      });
    }
  } else {
    return res.render('login',
                      {errormsg : 'Nach Pw Änderung bitte erneut anmelden'});
  }

  await sessionHandler.updteUserPwFromSession(req.body.newPw);
  connection.updateUserPw(req);

  return res.render('login', {errormsg : req.t('loginErrorPwChange')});
}

export default {
  signUp,
  routes: {post: {logout, signIn, changePw}},
  getUserFromSession
};
