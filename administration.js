// This script runs on serverside

// dependencies required for the app
var connection = require('../Pw-manager-nodejs/Database/database');
var languageImport = require('../Pw-manager-nodejs/language');
var language = languageImport.getEnglish();
var escape = require('lodash.escape');
let encryptArray = []; // Darf nicht in die function rein.

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

  try {

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
  } catch (err) {
    console.log("Error in ShowPw: " + err);
  }
};

async function copyPw(req, res) { return await getDecriptedPw(req, res); };

async function getDecriptedPw(req, res) {

  try {

    if (req.session.loggedIn) {

      let decryptedPw = await connection.getDecriptedPw(req, res);

      if (decryptedPw !== null) {
        res.send(escape(decryptedPw));
      }
    }
  } catch (err) {
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
  } catch (err) {
    console.log("Error in changePwApp: " + err);
  }
};

module.exports = {
  changePwApp,
  copyPw,
  showPw,
  deletePw,
  addNewPw
}