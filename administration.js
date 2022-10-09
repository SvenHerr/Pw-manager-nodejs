// This script runs on serverside

//dependencies required for the app
var connection = require('../Pw-manager-nodejs/Database/database');
var languageImport = require('../Pw-manager-nodejs/language');
var language = languageImport.getEnglish();
const dateLib = require('date-and-time');
var escape = require('lodash.escape');
const { decrypt } = require('./crypto/crypto');
var customer = require('../Pw-manager-nodejs/customer');
const crypto = require('crypto');
const dateObject = new Date();
// current date
const date = (`0 ${dateObject.getDate()}`).slice(-2);
// current month
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
// current year
const year = dateObject.getFullYear();

let encryptArray = []; // Darf nicht in die function rein.


async function loadData(req, res) {

    try {

        if(req.session.loggedIn != true){
            return res.render("login", { errormsg: "" });
        }
        console.log("LoadDate Username= " + req.session.username);

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

            return res.render("index", { pwDatas: pwItemList, userData: customer.getUserFromSession(req), date: dateLib, currentDate: `${month}/${date}/${year}` });

        } else {
            return res.render("login", { errormsg: "" });
        }   
        
    } catch (err) {
        console.log("Error on load: " + err);
    }
};

async function getCustomers(req,res) {

    try {

        return await connection.getCustomers();
           
    } catch (err) {
        console.log("getCustomers err: " + err);
    }
};

async function getCustomersDetails(req) {

    try {

        return await connection.getCustomersDetailsById(req.body.id);
           
    } catch (err) {
        console.log("getCustomersDetails err: " + err);
    }
};

async function addNewPw(req, res) {

    try {

        await connection.insertPw(req, res);
        
        res.redirect("/");
           
    } catch (err) {
        console.log("addnewpw err: " + err);
    }
};



async function deletePw(req, res) {

    try {

        if (req.body.confirmation == "yes") {
            
            await connection.deletePw(req.body.elementId);

            res.redirect("/");
            
        }
    } catch (err) {
        console.log("deletePw err: " + err);
    }
};



async function showPw(req, res) {

   try{

    if (encryptArray.includes(req.body.id)) {

        const index = encryptArray.indexOf(req.body.id);
        if (index > -1) {
            encryptArray.splice(index, 1);
        }

        res.send(escape("*****"));

    } else {
        encryptArray.push(req.body.id);

        const index = encryptArray.indexOf(req.body.id);

        if (encryptArray[index] != null) {

            return await getDecriptedPw(req, res);

        }
    }
   }catch(err){
        console.log("Error in ShowPw: " + err);
   }
    
};



async function copyPw(req, res) {

    return await getDecriptedPw(req, res);
};



async function getDecriptedPw(req, res) {

    try{

        if (req.session.loggedIn) {

            let decryptedPw = await connection.getDecriptedPw(req, res);
            
            if(decryptedPw !== null){
                res.send(escape(decryptedPw));
            }
        }
    }catch(err){
        console.log("Error in getDecriptedPw: " + err);
    }
    
}



/**
 * Changes the pw from row
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function changePwApp(req, res) {

    try {
        
        if (escape(req.body.newPw) !== escape(req.body.newPw1)) {
            return language.pwMissmatch;
        }

        if (escape(req.body.changeelement) === null) {
            return language.idIsNotDefined;
        }

        if (req.session.loggedIn) {

            await connection.updatePwById(req)
            
            res.redirect("/");
            
        } 
    } 
    catch (err) {
        console.log("Error in changePwApp: " + err);
    }
};



module.exports = { 
    changePwApp, 
    copyPw, 
    showPw, 
    deletePw, 
    addNewPw,
    getCustomers,
    loadData ,
    getCustomersDetails
}