const { connection, View, Add, Update, Delete } = require("./lib/sql_queries");
const inquirerQuestions = require("./lib/inquirer");

const view = new View();
const add = new Add();
const update = new Update();
const remove = new Delete();

// view.viewAllEmployees();
// view.viewAllByDepartment("Engineering");
// view.viewAllByRole("Sales Lead");
// view.viewAllByManager(5);

// add.addEmployee("Dan", "Phillips", "3", "3");
// update.updateEmployeeManager("1", null);
// update.updateEmployeeRole("9", "3");
// update.updateRoleDepartment("1", "1");
// remove.removeEmployee("9");
// add.addRole("Marketing Assistant", "30000", "1");
// remove.removeRole("9");
// add.addDepartment("Marketing");
// remove.removeDept("5");
// view.viewAll("department");
// view.viewAllEmployees();

inquirerQuestions.initialQuestion();

