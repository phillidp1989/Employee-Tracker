const mysql = require("mysql");
const util = require("util");
const consoleTable = require("console.table");
const join = `SELECT
e.id, 
e.first_name, 
e.last_name, 
r.title as role, 
d.name as department, 
r.salary, 
CONCAT(m.first_name, " ", m.last_name) as manager 
FROM employee AS e
LEFT JOIN role r ON e.role_id = r.id
LEFT JOIN department d ON r.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id`;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "phillidp1989",
  password: "Welbeck19",
  database: "employee_tracker_db",
});

// Promisify connection.query method when querying data from database

const queryAsync = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
  if (err) {
    console.log("ERROR - sql_queries.js - connection.connect: ", err);
  }
  console.log("Connect as ID: " + connection.threadId);
});

// Classes to manage different CRUD operations through SQL queries

class View {
  constructor() {}

  async viewAllEmployees() {
    try {
      const allEmployees = await queryAsync(`${join} ORDER BY e.id`);
      console.log("\n");      
      console.table(allEmployees);      
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllEmployees(): ", err);
      return null;
    }
  }

  async viewAllByDepartment(department) {
    try {
      const allDepts = await queryAsync(`${join} WHERE d.name = '${department}' ORDER BY e.id`);
      console.log(`Below is a list of all employees within the ${department} Department\n`);      
      console.table(allDepts);
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByDepartment(): ", err);
      return null;
    }
  }

  async viewAllByRole(role) {
    try {
      const allRoles = await queryAsync(`${join} WHERE r.title = '${role}' ORDER BY e.id`);
      console.log(`Below is a list of all employees with a role of ${role}\n`);      
      console.table(allRoles);
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByRole(): ", err);
      return null;
    }
  }

  async viewAllByManager(managerId) {
    try {
      const allManagers = await queryAsync(`${join} WHERE e.manager_id = '${managerId}' ORDER BY e.id`);
      const manager = allManagers[0].manager;      
      console.log(`Below is a list of all employees managed by ${manager}\n`);      
      console.table(allManagers);
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByManager(): ", err);
      return null;
    }
  }

  async viewAll(response) {
    try {
      const data = await queryAsync(`SELECT * FROM ${response}`);            
      console.log(`Below is a list of all ${response}s in the company\n`);      
      console.table(data);
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAll(): ", err);
      return null;
    }
  }
}

module.exports = {
  connection,
  View
};
