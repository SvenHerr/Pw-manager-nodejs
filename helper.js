

const dateLib = require('date-and-time');

function getCurrentDate() {
    var tempDate = new Date();
    return dateLib.format(tempDate, 'YYYY-MM-DD');
}

module.exports = {getCurrentDate};