const mysql = require("mysql");
require("dotenv").config();

const username = process.env.USER;
const password = process.env.PASSWORD;

// Create connection to DB and enter credentials
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: username,
    password: password,
    database: "employee_tracker_db",
  }); 

  
  // Connect to DB
  connection.connect((err) => {
    if (err) {
      console.log("ERROR - sql_queries.js - connection.connect: ", err);
    }    
  });

  module.exports = connection;