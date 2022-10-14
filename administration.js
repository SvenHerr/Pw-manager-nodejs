// This script runs on serversider

//dependencies required for the app
import connection from './Database/database.js';
import escape from 'lodash.escape';
import customer from './customer.js';
import moment from 'moment';
import { decrypt } from './crypto/crypto.js';
import { promisify } from 'es6-promisify';

let encryptArray = []; // Darf nicht in die function rein.

async function loadData(req, res) {
    try {
        if (!req.session.loggedIn) {
            return;//res.render('login', { errormsg: '' });
        }
        
        console.log('LoadDate Username= ' + req.session.username);

        let pwItemList = await connection.getAllPwFromUser(req);

        if (req.session.loggedIn) {
            pwItemList.forEach(row => {
                try {
                    row.Name = decrypt(row.Name, req.session.pw);

                    if (row.Loginname != null) {
                        row.Loginname = decrypt(row.Loginname, req.session.pw);
                    }

                    row.Pw = decrypt(row.Pw.toString(), req.session.pw);
                } catch (err) {
                    console.log(err);
                }
            });

            let errormsg = req.session.errormsg;
            req.session.errormsg = undefined;

            return res.render('index', { errormsg, pwDatas: pwItemList, userData: customer.getUserFromSession(req), moment: moment });
        } else {
            return; //res.render('login', { errormsg: '' });
        }
    } catch (err) {
        console.log('Error on load: ' + err);
    }
}

/** Returns customers list to ajax call
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function getCustomers(req,res) {
    try {
        res.send(await connection.getCustomers());
    } catch (err) {
        console.log('addnewpw err: ' + err);
    }
}

async function addNewPw(req, res) {
    try {
        await connection.insertPw(req, res);

        res.redirect('/');
    } catch (err) {
        console.log('addnewpw err: ' + err);
    }
}

async function deletePw(req, res) {
    try {
        if (req.body.confirmation === 'yes') {
            await connection.deletePw(req.body.elementId);

            res.redirect('/');
        }
    } catch (err) {
        console.log('deletePw err: ' + err);
    }
}

async function showPw(req, res) {
    try{
        if (encryptArray.includes(req.body.id)) {
            let index = encryptArray.indexOf(req.body.id);
            if (index > -1) {
                encryptArray.splice(index, 1);
            }

            res.send(escape('*****'));
        } else {
            encryptArray.push(req.body.id);

            let index = encryptArray.indexOf(req.body.id);

            if (encryptArray[index] != null) {
                return await getDecriptedPw(req, res);
            }
        }
    }catch(err){
        console.log('Error in ShowPw: ' + err);
    }
}

async function copyPw(req, res) {
    return await getDecriptedPw(req, res);
}

async function getDecriptedPw(req, res) {
    try{
        if (req.session.loggedIn) {
            let decryptedPw = await connection.getDecriptedPw(req, res);

            if(decryptedPw !== null){
                res.send(escape(decryptedPw));
            }
        }
    }catch(err){
        console.log('Error in getDecriptedPw: ' + err);
    }
}

/**
 * Changes the pw from row
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function changePw(req, res) {
    try {
        if (escape(req.body.newPw) !== escape(req.body.newPw1)) {
            req.session.errormsg = req.t('pwMissmatch');
        }

        if (escape(req.body.changeelement) === null) {
            req.session.errormsg = req.t('idIsNotDefined');
        }

        if (req.session.loggedIn) {
            await connection.updatePwById(req);
        }
    } catch (err) {
        console.log('Error in changePwApp: ' + err);
    }

    let save = promisify(req.session.save.bind(req.session));
    await save();
    res.redirect('/');
}

export default {
    loadData,
    routes: {
        post: {
            getCustomers,
            addNewPw,
            copyPw,
            changePw,
            deletePw,
            showPw
        }
    },
};
