const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

// to connect mysql/ connect to port
const connection = mysql.createConnection({
  host: "localhost",
  port: "3301",
  // in future/real job use more secure user and pw so no one can see our "Secret stuff"
  user: "root",
  password: "1234",
  database: "employee_trackerDB"
});

connection.connect(function (err) {
  if (err) throw err;
  // so we can run after it makes the connection, to start the user prompts
  firstPrompt();
});

// "choose your own adventure" prompts
function firstPrompt() {
  inquirer.prompt({
    type: "list",
    name: "task",
    message: "What would you like to do?",
    choices: [
      "View Employees",
      "View Employees by Department",
      "Add Employee",
      "Remove Employee",
      "Update Employee Role",
      "Add Role",
      "Add Department",
      "Exit"
    ]
  })
  .then(function ({ task }) {
    switch (task) {
      case "View Employees":
        viewAllEmployees();
        break;

      case "View Employees by Department":
        viewEmployeesByDepartment();
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

      case "Add Role":
        addRole();
        break;

      case "Exit":
        connection.end();
        break;
    }
  });
};

// to view the employees/ read all/ select/ see list
function viewAllEmployees() {
  console.log("Viewing employees\n");

  let query =
  `SELECT
    employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  Left JOIN role
    ON employee.role_id = role.id
  LEFT JOIN department
    ON department.id = role.department_id
  LEFT JOIN employee manager
    ON manager.id = employee.manager_id`
  
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
      console.log("Viewed employees\n");
      firstPrompt();
    });
};

// view them by department
function viewEmployeesByDepartment() {
  console.log("Viewing employees by department\n");

  let query =
  `SELECT
    department.id,
    department.name,
    role.salary
  FROM employee
  LEFT JOIN role
    ON employee.role_id = role.id
  LEFT JOIN department
    ON department.id = role.department_id
  GROUP BY department.id, department.name, role.salary`;

  connection.query(query, (err, res) => {
    if (err) throw err;
    const departmentChoices = res.map((choices) => ({
      value: choices.id, name: choices.name
    }));

    console.table(res);
    console.log("Viewed departments\n");

    getDepartment(departmentChoices);
  });
};