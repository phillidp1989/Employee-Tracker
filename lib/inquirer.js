const inquirer = require("inquirer");
const { View, Add, Update, Delete } = require("../lib/sql_queries");
const { nameValidation, numberValidation } = require("./validate");

// Instantiate objects
const view = new View();
const add = new Add();
const update = new Update();
const remove = new Delete();

// Confirm function to be reused for delete actions
const confirmationQ = async (deletedItem) => {
  const { confirm } = await inquirer.prompt([
    {
      type: "list",
      message: `Are you sure you wish to remove ${deletedItem} from the company?`,
      choices: ["Yes", "No"],
      name: "confirm",
    },
  ]);
  return confirm;
};

// Initial question function
const initialQuestion = async () => {

  // Call SQL queries to retrieve employee, role and dept data and map method to retrieve titles for inquirer choices

  const employeeData = await view.getEmployeeData();
  const employeeArray = employeeData.map(name => name.full_name);
  const managerData = await view.getManagerData();
  const managerArray = managerData.map(name => name.full_name);
  const roleData = await view.getRoleData();
  const roleArray = roleData.map(name => name.title);
  const dept = await view.getDepartmentData();

  // Inquirer prompt for initial question
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
        "Add Role",
        "Remove Role",
        "Update Role Department",
        "View All Departments",
        "Add Department",
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
      employeesByDept(dept);
      break;
    case "View All Employees by Manager":
      employeesByManager(managerData, managerArray);
      break;
    case "Add Employee":
      addEmployee(roleData, roleArray, employeeData, employeeArray);
      break;
    case "Remove Employee":
      deleteEmployee(employeeData, employeeArray);
      break;
    case "Update Employee Role":
      updateEmployeeRole(employeeData, employeeArray, roleData, roleArray);
      break;
    case "Update Employee Manager":
      updateEmployeeManager(employeeData, employeeArray);
      break;
    case "View All Roles":
      await view.viewAll("role");
      initialQuestion();
      break;
    case "Add Role":
      addRole(dept);
      break;
    case "Remove Role":
      deleteRole(roleData, roleArray);
      break;
    case "Update Role Department":
      updateRoleDept(roleData, roleArray, dept);
      break;
    case "View All Departments":
      await view.viewAll("department");
      initialQuestion();
      break;
    case "Add Department":
      addDept();
      break;
    case "Remove Department":
      deleteDepartment(dept);
      break;
    case "View Total Utilized Budget of Department":
      departmentSalaries(dept);
      break;
    default:
      console.log("Apologies, something seems to have gone wrong. Please reload the application.");
      break;
  }
};

// Function to view all employees by a specific department
const employeesByDept = async dept => {
  try {
    const { allEmployeeDept } = await inquirer.prompt([
      {
        type: "list",
        message: "Please choose a department",
        choices: dept,
        name: "allEmployeeDept",
      },
    ]);

    // Call function to initialize SQL query to retrieve all employees by a specific department
    await view.viewAllByDepartment(allEmployeeDept);

    // Call the initialQuestion function to restart the process
    await initialQuestion();

  } catch (error) {
    console.log("ERROR - inquirer.js - employeesByDept(): ", error);
  }
};

// Function to view all employees by manager
const employeesByManager = async (managerData, managerArray) => {

  try {
    const { allEmployeeManager } = await inquirer.prompt([
      {
        type: "list",
        message: "Please choose a manager",
        choices: managerArray,
        name: "allEmployeeManager",
      },
    ]);

    // Find record of the manager chosen by the user
    const result = managerData.find(obj => obj.full_name === allEmployeeManager);

    // Call the viewAllByManager function with the chosen manager ID passed in
    await view.viewAllByManager(result.id);
    await initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - employeesByManager(): ", error);
  }

};

// Function to add a new employee to DB
const addEmployee = async (roleData, roleArray, employeeData, employeeArray) => {

  // Addition of a 'none' option if the new employee being added does not have a manager
  employeeArray.push("None");

  try {
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
        choices: employeeArray,
        name: "manager",
      },
    ]);

    // Find correct record from DB based on user response
    const roleResult = roleData.find(obj => obj.title === createEmployee.role);
    const managerResult = employeeData.find(obj => obj.full_name === createEmployee.manager);

    // If statement to manage manager selection in the event that the employee does not have a manager
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
  } catch (error) {
    console.log("ERROR - inquirer.js - addEmployee(): ", error);
  }

};

// Function to remove employee from the DB
const deleteEmployee = async (employeeData, employeeArray) => {

  try {
    const { removedEmployee } = await inquirer.prompt([
      {
        type: "list",
        message: "Which employee would you like to remove?",
        choices: employeeArray,
        name: "removedEmployee",
      },
    ]);
    // Find correct record from DB based on user response
    const employeeResult = employeeData.find(obj => obj.full_name === removedEmployee);

    // Call the confirmationQ function to check that the user wishes to delete an employee
    const proceed = await confirmationQ(removedEmployee);
    if (proceed === "Yes") {
      await remove.removeEmployee(removedEmployee, employeeResult.id);
    }
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - deleteEmployee(): ", error);
  }
};

// Function to update the role of an existing employee
const updateEmployeeRole = async (employeeData, employeeArray, roleData, roleArray) => {

  try {
    const updateEmployeeRoleQ = await inquirer.prompt([
      {
        type: "list",
        message: "Which employee would you like to select to update their role?",
        choices: employeeArray,
        name: "employeePick",
      },
      {
        type: "list",
        message: "Choose the role you would like to assign to this employee",
        choices: roleArray,
        name: "rolePick",
      },
    ]);

    // Find correct record from DB based on user response
    const employeeResult = employeeData.find(obj => obj.full_name === updateEmployeeRoleQ.employeePick);
    const roleResult = roleData.find(obj => obj.title === updateEmployeeRoleQ.rolePick);

    // Call updateEmployeeRole function to insert records into DB
    await update.updateEmployeeRole(
      updateEmployeeRoleQ.employeePick,
      updateEmployeeRoleQ.rolePick,
      employeeResult.id,
      roleResult.id
    );

    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - updateEmployeeRole(): ", error);
  }

};

// Function to update manager of existing employee
const updateEmployeeManager = async (employeeData, employeeArray) => {

  try {
    const { employeePick } = await inquirer.prompt([
      {
        type: "list",
        message:
          "Which employee would you like to select to update their manager?",
        choices: employeeArray,
        name: "employeePick",
      },
    ]);

    // Ensure that the list of potential managers does not include the employee being updated
    const employeesMinusCurrent = employeeArray.filter(obj => obj !== employeePick);

    const { managerPick } = await inquirer.prompt([
      {
        type: "list",
        message: "Choose the new manager of this employee",
        choices: employeesMinusCurrent,
        name: "managerPick",
      },
    ]);

    // Find correct record from DB based on user response
    const employeeResult = employeeData.find(obj => obj.full_name === employeePick);
    const managerResult = employeeData.find(obj => obj.full_name === managerPick);

    // Call updateEmployeeManager function to update record in DB
    await update.updateEmployeeManager(
      employeePick,
      managerPick,
      employeeResult.id,
      managerResult.id
    );
    // Call initialQuestion function to restart process    
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - updateEmployeeManager(): ", error);
  }
};

// Function to add a new role type to DB
const addRole = async dept => {

  try {
    const createRole = await inquirer.prompt([
      {
        type: "input",
        message: "What is the title of the new role?",
        name: "roleTitle",
        validate: nameValidation,
      },
      {
        type: "input",
        message: "What is the salary of the new role?",
        name: "roleSalary",
        validate: numberValidation,
      },
      {
        type: "list",
        message: "Choose a department for this new role",
        choices: dept,
        name: "newRoleDept",
      },
    ]);

    // Find correct record from DB based on user response
    const deptResult = dept.find(obj => obj.name === createRole.newRoleDept);

    // Call updateEmployeeManager function to update record in DB
    await add.addRole(createRole.roleTitle, createRole.roleSalary, deptResult.id);

    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - addRole(): ", error);
  }

};

// Function to delete existing role from the DB
const deleteRole = async (roleData, roleArray) => {
  
  try {
    const { deleteRole } = await inquirer.prompt([
      {
        type: "list",
        message: "Which role would you like to remove?",
        choices: roleArray,
        name: "deleteRole",
      },
    ]);
    
    // Find correct record from DB based on user response
    const roleResult = roleData.find(obj => obj.title === deleteRole);
    
    // Call the confirmationQ function to check that the user wishes to delete a role
    const proceed = await confirmationQ(deleteRole);
    if (proceed === "Yes") {
      await remove.removeRole(roleResult.id, roleResult.title);
    }
    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - deleteRole(): ", error);
  }
  
};

// Function to update which department a particular role is in
const updateRoleDept = async (roleData, roleArray, dept) => {
  try {
    const roleDeptQ = await inquirer.prompt([
      {
        type: "list",
        message: "Which role would you like update the department?",
        choices: roleArray,
        name: "roleDept",
      },
      {
        type: "list",
        message: "Which department would you like to move this role to?",
        choices: dept,
        name: "updatedRoleDept",
      },
    ]);
    
    // Find correct record from DB based on user response
    const roleResult = roleData.find(obj => obj.title === roleDeptQ.roleDept);
    const deptResult = dept.find(obj => obj.name === roleDeptQ.updatedRoleDept);

     // Call updateRoleDepartment function to update record in DB
    await update.updateRoleDepartment(
      roleResult.id,
      deptResult.id,
      roleDeptQ.roleDept,
      roleDeptQ.updatedRoleDept
    );

    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - updateRoleDept(): ", error);
  }
};

// Function to add new department to DB
const addDept = async () => {
  
  try {
    const { newDept } = await inquirer.prompt([
      {
        type: "input",
        message: "What is the name of the new department?",
        name: "newDept",
        validate: nameValidation,
      },
    ]);
    // Call addDepartment function to update record in DB
    await add.addDepartment(newDept);

    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - addDept(): ", error);
  }  
};

// Function to delete an existing department from DB
const deleteDepartment = async dept => {
  
  try {
    const { removedDept } = await inquirer.prompt([
      {
        type: "list",
        message: "What is the name of the new department?",
        choices: dept,
        name: "removedDept",
      }
    ]);
    
     // Find correct record from DB based on user response
    const deptResult = dept.find(obj => obj.name === removedDept);
  
    // Call the confirmationQ function to check that the user wishes to delete a role
    const proceed = await confirmationQ(removedDept);
    if (proceed === "Yes") {
      await remove.removeDept(deptResult.id, removedDept);
    }
    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - deleteDepartment(): ", error);
  }
  
};

// Function to view combined salaries for a dept
const departmentSalaries = async dept => {
  
  try {
    const { combinedSalary } = await inquirer.prompt([
      {
        type: "list",
        message: "Which department would you like to see the combined salaries for?",
        choices: dept,
        name: "combinedSalary",
      }
    ]);
  
    // Call getBudgetData function to retrieve data from DB and display in the console
    await view.getBudgetData(combinedSalary);
  
    // Call initialQuestion function to restart process
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - departmentSalaries(): ", error);
  }
  
}

module.exports = {
  initialQuestion,
};
