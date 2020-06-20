const inquirer = require("inquirer");
const { connection, View, Add, Update, Delete } = require("../lib/sql_queries");
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

// Initial question

const initialQuestion = async () => {
  
  const employeeData = await view.getEmployeeData();
  const employeeArray = employeeData.map((name) => {
    return name.full_name;
  });
  const managerData = await view.getManagerData();
  const managerArray = managerData.map((name) => {
    return name.full_name;
  });
  const roleData = await view.getRoleData();
  const roleArray = roleData.map((name) => {
    return name.title;
  });

  const dept = await view.getDepartmentData();  

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
      console.log(
        "Apologies, something seems to have gone wrong. Please reload the application."
      );

      break;
  }
};

const employeesByDept = async (dept) => {
  try {
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
  } catch (error) {
    console.log("ERROR - inquirer.js - employeesByDept(): ", error);
  }
};

const employeesByManager = async (managerData, managerArray) => {
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

const addEmployee = async (roleData, roleArray, managerData, managerArray) => {
  employeeArray.push("None");
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
  const managerResult = employeeData.find((obj) => {
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

const deleteEmployee = async (employeeData, employeeArray) => {
  const { removedEmployee } = await inquirer.prompt([
    {
      type: "list",
      message: "Which employee would you like to remove?",
      choices: employeeArray,
      name: "removedEmployee",
    },
  ]);
  const employeeResult = employeeData.find((obj) => {
    return obj.full_name === removedEmployee;
  });

  const proceed = await confirmationQ(removedEmployee);
  if (proceed === "Yes") {
    await remove.removeEmployee(removedEmployee, employeeResult.id);
  }
  initialQuestion();
};

const updateEmployeeRole = async (
  employeeData,
  employeeArray,
  roleData,
  roleArray
) => {
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

  const employeeResult = employeeData.find((obj) => {
    return obj.full_name === updateEmployeeRoleQ.employeePick;
  });
  const roleResult = roleData.find((obj) => {
    return obj.title === updateEmployeeRoleQ.rolePick;
  });

  await update.updateEmployeeRole(
    updateEmployeeRoleQ.employeePick,
    updateEmployeeRoleQ.rolePick,
    employeeResult.id,
    roleResult.id
  );
  initialQuestion();
};

const updateEmployeeManager = async (employeeData, employeeArray) => {
  const { employeePick } = await inquirer.prompt([
    {
      type: "list",
      message:
        "Which employee would you like to select to update their manager?",
      choices: employeeArray,
      name: "employeePick",
    },
  ]);

  const employeesMinusCurrent = employeeArray.filter((obj) => {
    return obj !== employeePick;
  });

  const { managerPick } = await inquirer.prompt([
    {
      type: "list",
      message: "Choose the new manager of this employee",
      choices: employeesMinusCurrent,
      name: "managerPick",
    },
  ]);

  const employeeResult = employeeData.find((obj) => {
    return obj.full_name === employeePick;
  });
  const managerResult = employeeData.find((obj) => {
    return obj.full_name === managerPick;
  });

  await update.updateEmployeeManager(
    employeePick,
    managerPick,
    employeeResult.id,
    managerResult.id
  );
  initialQuestion();
};

const addRole = async (dept) => {
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

  const deptResult = dept.find((obj) => {
    return obj.name === createRole.newRoleDept;
  });
  await add.addRole(createRole.roleTitle, createRole.roleSalary, deptResult.id);
  initialQuestion();
};

const deleteRole = async (roleData, roleArray) => {
  const { deleteRole } = await inquirer.prompt([
    {
      type: "list",
      message: "Which role would you like to remove?",
      choices: roleArray,
      name: "deleteRole",
    },
  ]);
  const roleResult = roleData.find((obj) => {
    return obj.title === deleteRole;
  });
  const proceed = await confirmationQ(deleteRole);
  if (proceed === "Yes") {
    await remove.removeRole(roleResult.id, roleResult.title);
  }
  initialQuestion();
};

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
    const roleResult = roleData.find((obj) => {
      return obj.title === roleDeptQ.roleDept;
    });
    const deptResult = dept.find((obj) => {
      return obj.name === roleDeptQ.updatedRoleDept;
    });
    await update.updateRoleDepartment(
      roleResult.id,
      deptResult.id,
      roleDeptQ.roleDept,
      roleDeptQ.updatedRoleDept
    );
    initialQuestion();
  } catch (error) {
    console.log("ERROR - inquirer.js - updateRoleDept(): ", error);
  }
};

const addDept = async () => {
  const { newDept } = await inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the new department?",
      name: "newDept",
      validate: nameValidation,
    },
  ]);
  await add.addDepartment(newDept);
  initialQuestion();
};

const deleteDepartment = async (dept) => {
  const { removedDept } = await inquirer.prompt([
    {
      type: "list",
      message: "What is the name of the new department?",
      choices: dept,
      name: "removedDept",      
    }
  ]);
  const deptResult = dept.find((obj) => {
    return obj.name === removedDept;
  });
  const proceed = await confirmationQ(removedDept);
  if (proceed === "Yes") {
    await remove.removeDept(deptResult.id);
  }
  initialQuestion();
};

const departmentSalaries = async (dept) => {
  const { combinedSalary } = await inquirer.prompt([
    {
      type: "list",
      message: "Which department would you like to see the combined salaries for?",
      choices: dept,
      name: "combinedSalary",      
    }
  ]);
  await view.getBudgetData(combinedSalary);
  initialQuestion();
}

module.exports = {
  initialQuestion,
};
