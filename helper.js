// This script runs on serverside

import moment from "moment";

function getCurrentDate() {
    return moment().format("YYYY-MM-DD");
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line no-unused-vars
function logError(functionName, err, errorDescriptionUser, debug = false) {
    // TODO
}

export default { getCurrentDate, getRandomInt, logError };
