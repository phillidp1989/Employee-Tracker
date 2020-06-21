# Employee-Tracker

## Table of Contents:

[Description](#description)

[Visuals](#visuals)

[Installation](#installation)

[Usage](#usage)

[License](#license)

[Contributing](#contributing)

[Testing](#testing)

[Languages](#languages)

[Author](#author)

## Description:
Command line application which allows the user to view, update and delete employee, role and department records from an SQL database.

## Visuals:
![screenshot](https://github.com/phillidp1989/Employee-Tracker/blob/master/assets/demo.gif)

## Installation:
Clone folder onto local computer. Install all required npm modules by executing an 'npm install' command in the terminal of the root folder. Create your database in MySQL Workbench using the code in the schema.sql file and populate the tables using the code from the seeds.sql file. Update credentials in the connection.js file (config folder). Run the application by executing the command 'note app.js' in the terminal of the root folder.

## Usage:
The application makes use of the Inquirer npm package which asks the user a series of questions about what they would like to do with the employee, role and department data. Users can choose to view, update or remove records in any of these three tables and there is additional functionality which allows the user to view the total utilized budget of a department. When the user provides a response to the inquirer prompts, they will be presented with a message in the console, either displaying the data in a console.table or informing them that a particular action was successful or was not possible.

## License:
<img src="https://img.shields.io/github/license/phillidp1989/Employee-Tracker?logoColor=%23C2CAE8">

## Contributing:
No contributions

## Testing:
No testing framwework was used for this project

## Languages:
<img src="https://img.shields.io/github/languages/top/phillidp1989/Employee-Tracker">

## Author:
Name: Dan Phillips

Github Username: phillidp1989

Github Email Address: d.p.phillips@bham.ac.uk

<img src="https://avatars1.githubusercontent.com/u/61989740?v=4">
