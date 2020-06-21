const colors = require("colors");
const { initialQuestion } = require("./lib/inquirer");

console.log("\nWelcome to the Employee Tracker!\n".brightGreen.underline.bold);

// Initialise the application by calling the initialQuestion function
initialQuestion();

