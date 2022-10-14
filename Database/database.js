// This script runs on serverside

import conn from './databaseConnection.js';
import User from '../user.js';
import escape from 'lodash.escape';
import helper from '../helper.js';
import { encrypt, decrypt } from '../crypto/crypto.js';

let connection = null;

async function query(sql, params) {
    if (connection === null) {
        connection = await conn();
    }

    let [rows] = await connection.query(sql, params);

    return rows;
}

/** Gets user from db
 * 
 * @param {*} req 
 * @returns 
 */
async function getUser(req) {
    let rows = await query('SELECT * FROM user WHERE Username = ?', [req.body.username]);
    
    if (rows !== null) {
        if (rows.length > 0 ) {
            return new User(rows[0].Id, rows[0].Username, rows[0].Firstname, rows[0].Lastname, rows[0].Pw);
        }
    }

    return null;
}

/** Returns true if user exists in db
 * 
 * @param {*} username 
 * @returns true if user exists
 */
async function getUserExists(username) {
    let rows = await query('SELECT Id FROM user WHERE Username = ?', [username]);

    return rows.length > 0;
}

/** Get customers from db
 * 
 * @param {*} username 
 * @returns true if user exists
 */
async function getCustomers() {
    let rows = await query('SELECT * FROM customer');

    return rows;
}

/** Insert user to db
 * 
 * @param {*} user 
 */
async function insertUser(user) {
    await query('INSERT INTO user (username, firstname, lastname, createdate, pw) VALUES (?,?,?,?,?)', [user.username, user.firstname, user.lastname, helper.getCurrentDate(), user.pw]);
}

/** update user pw
 * 
 * @param {*} req 
 */
async function updateUserPw(req){
    let newPw = escape(req.body.newPw);

    await query('UPDATE user SET Pw = ? WHERE Username = ?', [newPw, req.session.username]);
}

/** update pw datensatz
 * 
 * @param {*} req 
 */
async function updatePwDatensatz(req,row){
    let oldPw = escape(req.body.oldPw);
    let newPw = escape(req.body.newPw);

    let decriptedName = decrypt(row.Name, oldPw);
    let encriptedName = encrypt(decriptedName, newPw);
    let decriptedPw = decrypt(row.Pw, oldPw);
    let encriptedPw = encrypt(decriptedPw, newPw);

    await query('UPDATE pw SET Name = ?, Pw = ? WHERE Id = ?', [encriptedName, encriptedPw, row.Id]);
}

/** update pw by id
 * 
 * @param {*} req 
 */
async function updatePwById(req) {
    let id = escape(req.body.changeelement);
    let newPw = escape(req.body.newPw);
    let encriptedPw = encrypt(newPw, req.session.pw);

    await query('UPDATE pw SET Pw = ?, CreateDate = ? WHERE Id = ?', [encriptedPw, helper.getCurrentDate(), id]);
}

/** get descripted pw from db
 * 
 * @param {*} req 
 * @returns 
 */
async function getDecriptedPw(req) {
    let rows = await query('SELECT * FROM pw WHERE Username =  ? AND Id = ?', [escape(req.session.username), escape(req.body.id)]);

    if(rows.length === 0){
        return '';
    }

    if (rows[0].Pw != null) {
        return decrypt(rows[0].Pw, escape(req.session.pw));
    }
}

/** get all pw for user from db
 * 
 * @param {*} req 
 * @returns 
 */
async function getAllPwFromUser(req) {
    let rows = await query('SELECT * FROM pw WHERE Username =  ?', [req.session.username]);

    return rows;
}

/** get pw from db
 * 
 * @param {*} req 
 */
// eslint-disable-next-line no-unused-vars
async function getPw(req) { 

}

/** delete pw from db
 * 
 * @param {*} id 
 */
async function deletePw(id) {
    await query('DELETE FROM `pw` WHERE Id = ?', [id]);
}

/** insert pw into db
 * 
 * @param {*} req 
 */
async function insertPw(req) {
    let encryptedpw = encrypt(escape(req.body.pw), escape(req.session.pw));
    let applicationname = encrypt(escape(req.body.applicationname), escape(req.session.pw));
    let loginname = encrypt(escape(req.body.loginname), req.session.pw.toString());

    await query('INSERT INTO `pw`(`Username`, `Name`, `Pw`, `Loginname`, `CreateDate` , `CustomerId`) VALUES (?,?,?,?,?,?)', 
        [escape(req.session.username), applicationname, encryptedpw, loginname, helper.getCurrentDate(),escape(req.body.customerId)]);
}

export default { 
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
    updatePwDatensatz,
    getCustomers 
};
