const inquirer = require("inquirer");
const { connection, View, Add, Update, Delete } = require("../lib/sql_queries");

// Instantiate objects
const view = new View();
const add = new Add();
const update = new Update();
const remove = new Delete();

// Initial question

const initialQuestion = async () => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "View All Roles",
        "Remove Role",
        "Update Role Ownership",
        "View All Departments",
        "Remove Department",
        "View Total Utilized Budget of Department",
      ],
      name: "action",
    },
  ]);

  //   Switch statement which calls relevant function based on user response
  switch (action) {
    case "View All Employees":
      await view.viewAllEmployees();
      initialQuestion();
      break;
    case "View All Employees by Department":
      employeesByDept();
      break;
    case "View All Employees by Manager":
      employeesByManager();
      break;
    case "Add Employee":
      addEmployee();
      break;
    case "Remove Employee":
      removeEmployee();
      break;
    case "Update Employee Role":
        updateEmployeeRole();
      break;
    case "Update Employee Manager":
      break;
    case "View All Roles":
      break;
    case "Remove Role":
      break;
    case "Update Role Ownership":
      break;
    case "View All Departments":
      break;
    case "Remove Department":
      break;
    case "View Total Utilized Budget of Department":
      break;

    default:
      console.log(
        "Apologies, something seems to have gone wrong. Please reload the application."
      );

      break;
  }
};

const employeesByDept = async () => {
  const dept = await view.getDepartmentData();
  const { allEmployeeDept } = await inquirer.prompt([
    {
      type: "list",
      message: "Please choose a department",
      choices: dept,
      name: "allEmployeeDept",
    },
  ]);
  await view.viewAllByDepartment(allEmployeeDept);
  await initialQuestion();
};

const employeesByManager = async () => {
  const managerData = await view.getManagerData();
  const managerArray = managerData.map((name) => {
    return name.full_name;
  });
  const { allEmployeeManager } = await inquirer.prompt([
    {
      type: "list",
      message: "Please choose a manager",
      choices: managerArray,
      name: "allEmployeeManager",
    },
  ]);

  // Find record of the manager chosen by the user
  const result = managerData.find((obj) => {
    return obj.full_name === allEmployeeManager;
  });
  // Call the viewAllByManager function with the chosen manager ID passed in
  await view.viewAllByManager(result.id);
  await initialQuestion();
};

const addEmployee = async () => {
  const roleData = await view.getRoleData();
  const roleArray = roleData.map((name) => {
    return name.title;
  });
  const managerData = await view.getManagerData();
  const managerArray = managerData.map((name) => {
    return name.full_name;
  });
  managerArray.push("None");
  const createEmployee = await inquirer.prompt([
    {
      type: "input",
      message: "What is the employee's first name?",
      name: "first",
    },
    {
      type: "input",
      message: "What is the employee's last name?",
      name: "last",
    },
    {
      type: "list",
      message: "What is the employee's role?",
      choices: roleArray,
      name: "role",
    },
    {
      type: "list",
      message: "Who is the employee's manager?",
      choices: managerArray,
      name: "manager",
    },
  ]);
  const roleResult = roleData.find((obj) => {
    return obj.title === createEmployee.role;
  });
  const managerResult = managerData.find((obj) => {
    return obj.full_name === createEmployee.manager;
  });
  if (!managerResult) {
    add.addEmployee(
      createEmployee.first,
      createEmployee.last,
      roleResult.id,
      null
    );
  } else {
    add.addEmployee(
      createEmployee.first,
      createEmployee.last,
      roleResult.id,
      managerResult.id
    );
  }
  initialQuestion();
};

const removeEmployee = async () => {
  const employeeData = await view.getEmployeeData();
  const employeeArray = employeeData.map((name) => {
    return name.full_name;
  });
  const { deleteEmployee } = await inquirer.prompt([
    {
      type: "list",
      message: "Which employee would you like to remove?",
      choices: employeeArray,
      name: "deleteEmployee",
    },
  ]);
  const employeeResult = employeeData.find((obj) => {
    return obj.full_name === deleteEmployee;
  });

  await remove.removeEmployee(deleteEmployee, employeeResult.id);
  initialQuestion();
};

const updateEmployeeRole = async () => {
  const employeeData = await view.getEmployeeData();
  const employeeArray = employeeData.map((name) => {
    return name.full_name;
  });
  const roleData = await view.getRoleData();
  const roleArray = roleData.map((name) => {
    return name.title;
  });

  const updateEmployeeRoleQ = await inquirer.prompt([
    {
        type: "list",
        message: "Which employee's role would you like to update?",
        choices: employeeArray,
        name: "employeePick",
      },
      {
        type: "list",
        message: "Choose the role you would like to assign to this employee",
        choices: roleArray,
        name: "rolePick",
      }
  ]);

  const employeeResult = employeeData.find((obj) => {
    return obj.full_name === updateEmployeeRoleQ.employeePick;
  });
  const roleResult = roleData.find((obj) => {
    return obj.title === updateEmployeeRoleQ.rolePick;
  });

  await update.updateEmployeeRole(updateEmployeeRoleQ.employeePick, updateEmployeeRoleQ.rolePick, employeeResult.id, roleResult.id);
  initialQuestion();

};

module.exports = {
  initialQuestion,
};
