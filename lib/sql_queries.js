const mysql = require("mysql");
const util = require("util");
const consoleTable = require("console.table");

// SQL query to join three tables and display all pertinent information held in a variable for re-use

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

// Establishing connection to database

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

// Class to retrieve data from DB

class View {
  constructor() {}

  async viewAllEmployees() {
    try {
      const allEmployees = await queryAsync(`${join} ORDER BY e.id`);
      console.log("\n");
      console.table(allEmployees);
      return allEmployees;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllEmployees(): ", err);
      return null;
    }
  }

  //   Method to return all employees in DB as an array to be used for inquirer choices

  async getEmployeeData() {
    try {
      const employeeData = await queryAsync(
        `SELECT *, CONCAT(employee.first_name, " ", employee.last_name) AS full_name FROM employee`
      );
      return employeeData;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllEmployees(): ", err);
      return null;
    }
  }

  async viewAllByDepartment(department) {
    try {
      const allDepts = await queryAsync(
        `${join} WHERE d.name = '${department}' ORDER BY e.id`
      );
      console.log(
        `\nBelow is a list of all employees within the ${department} Department\n`
      );
      console.table(allDepts);
      return allDepts;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByDepartment(): ", err);
      return null;
    }
  }

  async viewAllByRole(role) {
    try {
      const allRoles = await queryAsync(
        `${join} WHERE r.title = '${role}' ORDER BY e.id`
      );
      console.log(`Below is a list of all employees with a role of ${role}\n`);
      console.table(allRoles);
      return allRoles;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByRole(): ", err);
      return null;
    }
  }

  async viewAllByManager(managerId) {
    try {
      const allManagers = await queryAsync(
        `${join} WHERE e.manager_id = '${managerId}' ORDER BY e.id`
      );
      const manager = allManagers[0].manager;
      console.log(`Below is a list of all employees managed by ${manager}\n`);
      console.table(allManagers);
      return allManagers;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByManager(): ", err);
      return null;
    }
  }

  async getManagerData() {
    try {
      const managerData = await queryAsync(
        `SELECT DISTINCT m.id, CONCAT(m.first_name, " ", m.last_name) as full_name
        FROM employee e
        INNER JOIN employee m on e.manager_id = m.id;`
      );
      const managerArray = managerData.map((name) => {
        return name.full_name;
      });
      return managerData;
    } catch (err) {
      console.log("ERROR - sql_queries.js - getManagerData(): ", err);
      return null;
    }
  }

  async viewAll(response) {
    try {
      const data = await queryAsync(`SELECT * FROM ${response}`);
      console.log(`\nBelow is a list of all ${response}s in the company\n`);
      console.table(data);
      return data;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAll(): ", err);
      return null;
    }
  }

  //   Method to return all roles in DB as an array to be used for inquirer choices

  async getRoleData() {
    try {
      const roleData = await queryAsync(`SELECT * FROM role`);
      const roleArray = roleData.map((role) => {
        return role.title;
      });
      return roleData;
    } catch (err) {
      console.log("ERROR - sql_queries.js - getroleData(): ", err);
      return null;
    }
  }

  //   Method to return all departments in DB as an array to be used for inquirer choices

  async getDepartmentData() {
    try {
      const departmentData = await queryAsync(`SELECT * FROM department`);
      const departmentArray = departmentData.map((dept) => {
        return dept.name;
      });
      return departmentData;
    } catch (err) {
      console.log("ERROR - sql_queries.js - getDepartmentData(): ", err);
      return null;
    }
  }

  async getBudgetData(dept) {
    try {
      const budget = await queryAsync(
        `SELECT d.name AS department, SUM(salary) AS total_salary FROM department d JOIN role r ON d.id = r.department_id JOIN employee e ON e.role_id = r.id WHERE d.name = '${dept}';`
      );
      console.log(`\nBelow is a total utilized budget of the ${dept} department\n`);
      console.table(budget);
    } catch (err) {
      console.log("ERROR - sql_queries.js - getBudgetData(): ", err);
      return null;
    }
  }
}

// Class which holds methods to create records in DB

class Add {
  constructor() {}

  async addEmployee(firstName, lastName, roleId, managerId) {
    try {
      const newEmployee = await queryAsync(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', '${roleId}', ${managerId})`
      );
      console.log(
        `\nYou have successfully added ${firstName} ${lastName} to the list of employees\n`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addEmployee(): ", err);
      return null;
    }
  }

  async addRole(title, salary, departmentId) {
    try {
      const newRole = await queryAsync(
        `INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', '${departmentId}')`
      );
      console.log(
        `\nYou have successfully added '${title}' to the list of roles\n`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addRole(): ", err);
      return null;
    }
  }

  async addDepartment(name) {
    try {
      const newDepartment = await queryAsync(
        `INSERT INTO department (name) VALUES ('${name}')`
      );
      console.log(
        `\nYou have successfully added '${name}' to the list of departments\n`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addDepartment(): ", err);
      return null;
    }
  }
}

// Class which holds methods to update records in DB

class Update {
  constructor() {}

  async updateEmployeeManager(fullname, managerName, employeeId, managerId) {
    try {
      const changedManager = await queryAsync(
        `UPDATE employee e SET e.manager_id = '${managerId}' WHERE e.id = ${employeeId}`
      );
      console.log(
        `\nYou have successfully updated the manager of ${fullname} to ${managerName}\n`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateEmployeeManager(): ", err);
      return null;
    }
  }

  async updateEmployeeRole(fullname, rolename, employeeId, roleId) {
    try {
      const changedRole = await queryAsync(
        `UPDATE employee e SET e.role_id = '${roleId}' WHERE e.id = ${employeeId}`
      );
      console.log(
        `You have successfully updated the role of ${fullname} to ${rolename}`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateEmployeeRole(): ", err);
      return null;
    }
  }

  async updateRoleDepartment(roleId, departmentId, role, dept) {
    try {
      const changedRole = await queryAsync(
        `UPDATE role r SET r.department_id = '${departmentId}' WHERE r.id = ${roleId}`
      );
      console.log(
        `\nYou have successfull updated the department of ${role} to ${dept}\n`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateRoleDepartment(): ", err);
      return null;
    }
  }
}

// Class which holds methods to delete records in DB

class Delete {
  constructor() {}

  async removeEmployee(fullname, employeeId) {
    try {
      const deletedEmployee = await queryAsync(
        `DELETE FROM employee e WHERE e.id = '${employeeId}'`
      );
      console.log(`\nYou have successfully removed ${fullname}\n`);
    } catch (err) {
      console.log("ERROR - sql_queries.js - removeEmployee(): ", err);
      return null;
    }
  }

  async removeRole(roleId, title) {
    try {
      const deletedRole = await queryAsync(
        `DELETE FROM role r WHERE r.id = '${roleId}'`
      );
      console.log(`You have successfully deleted the ${title} role`);
    } catch (err) {
      console.log("ERROR - sql_queries.js - removeRole(): ", err);
      return null;
    }
  }

  async removeDept(departmentId) {
    try {
      const deletedDept = await queryAsync(
        `DELETE FROM department d WHERE d.id = '${departmentId}'`
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - removeDept(): ", err);
      return null;
    }
  }
}

module.exports = {
  connection,
  View,
  Add,
  Update,
  Delete,
};
