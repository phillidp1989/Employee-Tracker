const { connection, View } = require("./lib/sql_queries");

const view = new View();

view.viewAllEmployees();
view.viewAllByDepartment("Engineering");
view.viewAllByRole("Sales Lead");
view.viewAllByManager(5);
view.viewAll("role");
