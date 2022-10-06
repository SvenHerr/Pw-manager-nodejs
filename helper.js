// This script runs on serverside

const dateLib = require("date-and-time");

function getCurrentDate() {
  var tempDate = new Date();
  return dateLib.format(tempDate, "YYYY-MM-DD");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getCurrentDate,
  getRandomInt,
};
