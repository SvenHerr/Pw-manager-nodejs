// This script runs on serverside

// dependencies required for the app
var connection = require("../Pw-manager-nodejs/database");
var languageImport = require("../Pw-manager-nodejs/language");
const session = require("express-session");
var language = languageImport.getEnglish();
var escape = require("lodash.escape");

var encryptArray = [];

async function addNewPw(req, res) {
  try {
    await connection.addPw(req, res);

    res.redirect("/");
  } catch (err) {
    console.log("addnewpw err: " + err);
  }
}

async function deletePw(req, res) {
  try {
    if (req.body.confirmation == "yes") {
      console.log("in delete");
      console.log("in delete elementId" + req.body.elementId);

      await connection.deletePw(req.body.elementId);

      res.redirect("/");
    }
  } catch (err) {
    console.log("deletePw err: " + err);
  }
}

async function showPw(req, res) {
  if (encryptArray.includes(req.body.id)) {
    const index = encryptArray.indexOf(req.body.id);
    if (index > -1) {
      encryptArray.splice(index, 1);
    }

    res.send(escape("*****"));
  } else {
    encryptArray.push(req.body.id);

    const index = encryptArray.indexOf(req.body.id);

    var temp = encryptArray[index];

    if (temp != null) {
      return await getDecriptedPw(req, res);
    } else {
      console.log("encryptArray on index is null");
    }
  }
}

async function copyPw(req, res) {
  pwcopycalled = true;
  return await getDecriptedPw(req, res, pwcopycalled);
}

async function getDecriptedPw(req, res, pwcopycalled) {
  if (req.session.loggedIn) {
    let decryptedPw = await connection.getDecriptedPw(req, res);

    if (decryptedPw !== null) {
      res.send(escape(decryptedPw));
    } else {
      console.log("showpw");
    }
  }
}

/**
 * Changes the pw from row
 * @param {*} req
 * @param {*} res
 * @returns
 */
function changePwApp(req, res) {
  var newPw = escape(req.body.newPw);
  var newPwConfirmation = escape(req.body.newPw1);
  var id = escape(req.body.changeelement);

  if (newPw != newPwConfirmation) {
    return language.pwMissmatch;
  }

  if (id == null) {
    return language.idIsNotDefined;
  }

  if (req.session.loggedIn) {
    try {
      connection
        .updatePwById(req)
        .then(function () {
          console.log("redirect to / (changePwApp)");
          res.redirect("/");
        })
        .catch(function (err) {
          console.log("ChangePW update sql: " + err);
        });
    } catch (err) {
      console.log("ChangePW update sql: " + err);
    }
  } else {
    console.log("ChangePW else!");
  }
}

module.exports = {
  changePwApp,
  copyPw,
  showPw,
  deletePw,
  addNewPw,
};
