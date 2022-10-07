// This script runs on serverside

const dateLib = require('date-and-time');

function getCurrentDate() {
    let tempDate = new Date();
    return dateLib.format(tempDate, 'YYYY-MM-DD');
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logError(functionName, err, errorDescriptionUser, debug = false){
    
    // TODO

}

module.exports = {getCurrentDate, getRandomInt, logError};