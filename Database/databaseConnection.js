// This script runs on serverside

import mysql from 'mysql2/promise';

export default async function() {
  let conn = await mysql.createConnection({
    host : process.env.DB_SERVER,
    user : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    debug : false
  });

  return conn;
}
