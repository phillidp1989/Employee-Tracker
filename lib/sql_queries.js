const connection = require("../config/connection");
const util = require("util");
const consoleTable = require("console.table");
const colors = require("colors");

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

// Promisify connection.query method when querying data from database
const queryAsync = util.promisify(connection.query).bind(connection);


// Classes to manage different CRUD operations through SQL queries
// Class to retrieve data from DB
class View {
  constructor() { }

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
      console.log("ERROR - sql_queries.js - getEmployeeData(): ", err);
      return null;
    }
  }

  //   Method to log all employees in DB by specified department
  async viewAllByDepartment(department) {
    try {
      const allDepts = await queryAsync(
        `${join} WHERE d.name = '${department}' ORDER BY e.id`
      );
      console.log(
        `\nBelow is a list of all employees within the ${department} Department\n`.brightGreen
      );
      console.table(allDepts);
      return allDepts;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByDepartment(): ", err);
      return null;
    }
  }

  //   Method to log all employees in DB by specified role
  async viewAllByRole(role) {
    try {
      const allRoles = await queryAsync(
        `${join} WHERE r.title = '${role}' ORDER BY e.id`
      );
      console.log(`\nBelow is a list of all employees with a role of ${role}\n`.brightGreen);
      console.table(allRoles);
      return allRoles;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByRole(): ", err);
      return null;
    }
  }

  //   Method to log all employees in DB by specified manager
  async viewAllByManager(managerId) {
    try {
      const allManagers = await queryAsync(
        `${join} WHERE e.manager_id = '${managerId}' ORDER BY e.id`
      );
      const manager = allManagers[0].manager;
      console.log(`Below is a list of all employees managed by ${manager}\n`.brightGreen);
      console.table(allManagers);
      return allManagers;
    } catch (err) {
      console.log("ERROR - sql_queries.js - viewAllByManager(): ", err);
      return null;
    }
  }

  //   Method to return all employees who acts as a manager in DB
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

  //   Method to log all data in specific table based on user input
  async viewAll(response) {
    try {
      const data = await queryAsync(`SELECT * FROM ${response}`);
      console.log(`\nBelow is a list of all ${response}s in the company\n`.brightGreen);
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
      console.log("ERROR - sql_queries.js - getRoleData(): ", err);
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

  //   Method to log total salary of a given department
  async getBudgetData(dept) {
    try {
      const budget = await queryAsync(
        `SELECT d.name AS department, SUM(salary) AS total_salary FROM department d JOIN role r ON d.id = r.department_id JOIN employee e ON e.role_id = r.id WHERE d.name = '${dept}';`
      );
      console.log(`\nBelow is a total utilized budget of the ${dept} department\n`.brightGreen);
      console.table(budget);
    } catch (err) {
      console.log("ERROR - sql_queries.js - getBudgetData(): ", err);
      return null;
    }
  }
}

// Class which holds methods to create records in DB
class Add {
  constructor() { }

  //   Method to add a new employee to the DB
  async addEmployee(firstName, lastName, roleId, managerId) {
    try {
      const newEmployee = await queryAsync(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', '${roleId}', ${managerId})`
      );
      console.log(
        `\nYou have successfully added ${firstName} ${lastName} to the list of employees\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addEmployee(): ", err);
      return null;
    }
  }

  //   Method to add a new role to the DB
  async addRole(title, salary, departmentId) {
    try {
      const newRole = await queryAsync(
        `INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', '${departmentId}')`
      );
      console.log(
        `\nYou have successfully added '${title}' to the list of roles\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addRole(): ", err);
      return null;
    }
  }

  //   Method to add a new department to the DB
  async addDepartment(name) {
    try {
      const newDepartment = await queryAsync(
        `INSERT INTO department (name) VALUES ('${name}')`
      );
      console.log(
        `\nYou have successfully added '${name}' to the list of departments\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - addDepartment(): ", err);
      return null;
    }
  }
}

// Class which holds methods to update records in DB
class Update {
  constructor() { }

  //   Method to update an existing employee's manager
  async updateEmployeeManager(fullname, managerName, employeeId, managerId) {
    try {
      const changedManager = await queryAsync(
        `UPDATE employee e SET e.manager_id = '${managerId}' WHERE e.id = ${employeeId}`
      );
      console.log(
        `\nYou have successfully updated the manager of ${fullname} to ${managerName}\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateEmployeeManager(): ", err);
      return null;
    }
  }

  //   Method to update an existing employee's role
  async updateEmployeeRole(fullname, rolename, employeeId, roleId) {
    try {
      const changedRole = await queryAsync(
        `UPDATE employee e SET e.role_id = '${roleId}' WHERE e.id = ${employeeId}`
      );
      console.log(
        `\nYou have successfully updated the role of ${fullname} to ${rolename}\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateEmployeeRole(): ", err);
      return null;
    }
  }

  //   Method to update an existing role's department
  async updateRoleDepartment(roleId, departmentId, role, dept) {
    try {
      const changedRole = await queryAsync(
        `UPDATE role r SET r.department_id = '${departmentId}' WHERE r.id = ${roleId}`
      );
      console.log(
        `\nYou have successfull updated the department of ${role} to ${dept}\n`.brightGreen
      );
    } catch (err) {
      console.log("ERROR - sql_queries.js - updateRoleDepartment(): ", err);
      return null;
    }
  }
}

// Class which holds methods to delete records in DB

class Delete {
  constructor() { }

  async removeEmployee(fullname, employeeId) {
    try {
      const deletedEmployee = await queryAsync(
        `DELETE FROM employee e WHERE e.id = '${employeeId}'`
      );
      console.log(`\nYou have successfully removed ${fullname}\n`.brightGreen);
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
      console.log(`\nYou have successfully deleted the ${title} role\n`.brightGreen);
    } catch (err) {
      console.log("ERROR - sql_queries.js - removeRole(): ", err);
      return null;
    }
  }

  async removeDept(departmentId, dept) {
    try {
      const deletedDept = await queryAsync(
        `DELETE FROM department d WHERE d.id = '${departmentId}'`
      );
      console.log(`\nYou have successfully deleted the ${dept} department\n`.brightGreen);
    } catch (err) {
      console.log("ERROR - sql_queries.js - removeDept(): ", err);
      return null;
    }
  }
}

module.exports = {  
  View,
  Add,
  Update,
  Delete,
};
