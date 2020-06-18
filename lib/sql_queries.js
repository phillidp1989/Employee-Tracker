const mysql = require("mysql");
const util = require("util");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "phillidp1989",
    password: "Welbeck19",
    database: "employee_tracker_db"
})

// Promisify connection.query method when querying data from database

const queryAsync = util.promisify(connection.query).bind(connection);

connection.connect(err => {
    if (err) {
        console.log("ERROR - sql_queries.js - connection.connect: ", err);
    }
    console.log("Connect as ID: " + connection.threadId)
})

module.exports = {
    connection
}

