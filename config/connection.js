const mysql = require("mysql");

// Create connection to DB and enter credentials
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "phillidp1989",
    password: "Welbeck19",
    database: "employee_tracker_db",
  }); 

  
  // Connect to DB
  connection.connect((err) => {
    if (err) {
      console.log("ERROR - sql_queries.js - connection.connect: ", err);
    }    
  });

  module.exports = connection;