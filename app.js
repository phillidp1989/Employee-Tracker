const { connection, View, Add } = require("./lib/sql_queries");

const view = new View();
const add = new Add();

view.viewAllEmployees();
view.viewAllByDepartment("Engineering");
view.viewAllByRole("Sales Lead");
view.viewAllByManager(5);
view.viewAll("role");
add.addEmployee("Dan", "Phillips", "3", "3");
