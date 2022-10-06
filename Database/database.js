// This script runs on serverside

var conn = require('./databaseConnection');
var User = require('../user');
const {encrypt, decrypt} = require('../crypto/crypto');
var escape = require('lodash.escape');
var helper = require('../helper');
let connection = null;

async function query(sql, params) {
  if (connection === null) {
    connection = await conn();
  }

  let [rows] = await connection.query(sql, params);

  return rows;
}

/**
 * Gets user from db
 *
 * @param {*} req
 * @returns
 */
async function getUser(req) {

  let rows = await query('SELECT * FROM user WHERE Username = ?',
                         [ req.body.username ]);

  if (rows !== null) {
    if (rows.length > 0) {
      return new User(null, rows[0].Username, rows[0].Surname, rows[0].Lastname,
                      rows[0].Pw);
    }
  } else {
    console.log("reject");
    return null;
  }
}

/**
 * Returns true if user exists in db
 *
 * @param {*} username
 * @returns true if user exists
 */
async function getUserExists(username) {

  let rows =
      await query('SELECT Id FROM user WHERE Username = ?', [ username ]);

  return rows.length > 0;
}

/**
 * Insert user to db
 *
 * @param {*} user
 */
async function insertUser(user) {

  await query(
      'INSERT INTO user (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);',
      [
        user.id, user.username, user.surname, user.lastname,
        helper.getCurrentDate(), user.pw
      ]);
}

/**
 * update user pw
 *
 * @param {*} req
 */
async function updateUserPw(req) {

  var newPw = escape(req.body.newPw);
  await query('UPDATE user SET Pw = ? WHERE Username = ?',
              [ newPw, req.session.username ]);
}

/**
 * update pw datensatz
 *
 * @param {*} req
 */
async function updatePwDatensatz(req, row) {

  var oldPw = escape(req.body.oldPw);
  var newPw = escape(req.body.newPw);

  var decriptedName = decrypt(row.Name, oldPw);
  var encriptedName = encrypt(decriptedName, newPw);
  var decriptedPw = decrypt(row.Pw, oldPw);
  var encriptedPw = encrypt(decriptedPw, newPw);

  await query('UPDATE pw SET Name = ?, Pw = ? WHERE Id = ?',
              [ encriptedName, encriptedPw, row.Id ]);
}

/**
 * update pw by id
 *
 * @param {*} req
 */
async function updatePwById(req) {

  var id = escape(req.body.changeelement);
  var newPw = escape(req.body.newPw);
  var encriptedPw = encrypt(newPw, req.session.pw);

  await query('UPDATE pw SET Pw = ?, CreateDate = ? WHERE Id = ?',
              [ encriptedPw, helper.getCurrentDate(), id ]);
}

/**
 * get descripted pw from db
 *
 * @param {*} req
 * @returns
 */
async function getDecriptedPw(req) {

  let rows = await query('SELECT * FROM pw WHERE Username =  ? AND Id = ?',
                         [ escape(req.session.username), escape(req.body.id) ]);

  if (rows === null) {
    return null;
  }
  if (rows.length === 0) {
    return null;
  }

  if (rows[0].Pw != null) {
    return decrypt(rows[0].Pw, escape(req.session.pw));
  }
}

/**
 * get all pw for user from db
 *
 * @param {*} req
 * @returns
 */
async function getAllPwFromUser(req) {

  let rows = await query('SELECT * FROM pw WHERE Username =  ?',
                         [ req.session.username ]);

  return rows;
}

/**
 * get pw from db
 *
 * @param {*} req
 */
async function getPw(req) {}

/**
 * delete pw from db
 *
 * @param {*} id
 */
async function deletePw(id) {

  await query('DELETE FROM `pw` WHERE Id = ?', [ id ]);
}

/**
 * insert pw into db
 *
 * @param {*} req
 */
async function insertPw(req) {

  var encryptedpw = encrypt(escape(req.body.pw), escape(req.session.pw));
  var applicationname =
      encrypt(escape(req.body.applicationname), escape(req.session.pw));
  var loginname =
      encrypt(req.body.loginname.toString(), req.session.pw.toString());

  await query(
      'INSERT INTO `pw`(`Username`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)',
      [
        escape(req.session.username), applicationname, encryptedpw, loginname,
        helper.getCurrentDate(), Math.floor(Math.random() * 1000001).toString()
      ])
}

module.exports = {
  conn,
  getUserExists,
  insertUser,
  getUser,
  insertPw,
  deletePw,
  getPw,
  getDecriptedPw,
  updatePwById,
  getAllPwFromUser,
  updateUserPw,
  updatePwDatensatz
};