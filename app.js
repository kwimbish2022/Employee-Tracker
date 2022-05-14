const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

// to connect mysql/ connect to port
const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: "root",
        password: "rtfoSPANI2!",
        //   // in future/real job use more secure user and pw so no one can see our "Secret stuff"
        database: "employee_trackerDB"
    },
    console.log('Connected to the employee_trackerDB')
);


connection.connect(function (err) {
  if (err) throw err;
  // so we can run after it makes the connection, to start the user prompts
  firstPrompt();
});

// "choose your own adventure" prompts
function firstPrompt() {
  inquirer.prompt([
  {
    type: "list",
    name: "userChoice",
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
  }
  ]).then((res) => {
    console.log(res.userChoice)
    switch (res.userChoice) {
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

      case "Add Department":
        addDepartment();
        break;

      case "Exit":
        connection.end();
        break;
      }
  }).catch((err) => {
    if (err) throw err;
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

// to get the department
function getDepartment(departmentChoices) {
  inquirer.prompt([
    {
      type: "list",
      name: "department",
      message: "Departments:",
      choices: departmentChoices
    }
  ]).then((res) => {
    let query = 
    `SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title,
      department.name
    FROM employee
    JOIN role
      ON employee.role_id = role.id
    JOIN department
      ON department.id = role.department_id
    WHERE department.id = ?`
  
    connection.query(query, res.department, (err, res) => {
    if (err) throw err;
      firstPrompt();
      console.table(res);
    });
  })
};

// adding an employee
function addEmployee() {
  let query =
  `SELECT
    role.id,
    role.title,
    role.salary
  FROM role`

  connection.query(query, (err, res) => {
    if (err) throw err;
    const role = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`
    }));

    console.table(res),
    employeeRoles(role);
  });
};

function employeeRoles(role) {
  inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Employee first name:"
    },
    {
      type: "input",
      name: "lastName",
      message: "Employee last name:"
    },    
    {
      type: "input",
      name: "role_id",
      message: "Employee role:",
      choices: role
    }
  ]).then((res) => {
    let query = `INSERT INTO employee SET ?`
    connection.query(query, {
      first_name: res.firstName,
      last_name: res.lastName,
      role_id: res.role_id
    }, (err, res) => {
      if (err) throw err;
      firstPrompt();
    });
  });
}; 

// remove an employee
function removeEmployee() {
  let query =
  `SELECT
    employee.id,
    employee.first_name,
    employee.last_name
  FROM employee`

  connection.query(query, (err, res) => {
    if (err) throw err;
    const employee = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`
    }));
    console.table(res);
    getDelete(employee);
  });
};

function getDelete(employee) {
  inquirer.prompt([
    {
      type: "list",
      name: "employee",
      message: "Employee to be deleted:",
      choices: employee
    }
  ]).then((res) => {
    let query = `DELETE FROM employee WHERE ?`;
    connection.query(query, { id: res.employee }, (err, res) => {
      if (err) throw err;
      console.table(res);
      firstPrompt();
    });
  });
};

// update an employee's role
function updateEmployeeRole() {
  let query = `SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title,
      department.name,
      role.salary,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
      ON employee.role_id = role.id
    LEFT JOIN department
      ON department.id = role.department_id
    LEFT JOIN employee manager
      ON manager.id = employee.manager_id`

  connection.query(query, (err, res) => {
    if (err) throw err;
    const employee = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`
    }));
    console.table(res);
    updateRole(employee);
  });
};

function updateRole(employee) {
  let query =
  `SELECT
    role.id,
    role.title,
    role.salary
  FROM role`

  connection.query(query, (err, res) => {
    if (err) throw err;
    let roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`
    }));
    console.table(res);
    getUpdatedRole(employee, roleChoices);
  });
};

function getUpdatedRole(employee, roleChoices) {
  inquirer.prompt([
    {
      type: "list",
      name: "employee",
      message: `Employee whose role is being updated: `,
      choices: employee
    },
    {
      type: "list",
      name: "role",
      message: "Select new role: ",
      choices: roleChoices
    },
  ]).then((res) => {
    let query = `UPDATE employee SET role_id = ? WHERE id = ?`
    connection.query(query, [ res.role, res.employee], (err, res) => {
      if (err) throw err;
      firstPrompt();
    });
  });
};

// add a role
function addRole() {
  var query =
  `SELECT
    department.id,
    department.name,
    role.salary
  FROM employee
  JOIN role
    ON employee.role_id - role.id
  JOIN department
    ON department.id = role.department_id
  GROUP BY department.id, department.name`

  connection.query(query, (err, res) => {
    if (err) throw err;
    const department = res.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`
    }));
    console.table(res);
    addToRole(department);
  });
};

function addToRole(department) {
  inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Role title: "
    },
    {
      type: "input",
      name: "salary",
      message: "Role salary: "
    },
    {
      type: "list",
      name: "department",
      message: "Department: ",
      choices: department
    },
  ]).then((res) => {
    let query = `INSERT INTO role SET ?`;

    connection.query(query, {
      title: res.title,
      salary: res.salary,
      department_id: res.department
    }, (err, res) => {
      if (err) throw err;
      firstPrompt();
    });
  });
};

// add department
function addDepartment() {
  inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Department name: "
    }
  ]).then((res) => {
    let query = `INSERT INTO department SET ?`;
    connection.query(query, {name: res.name}, (err, res) => {
      if (err) throw err;
      firstPrompt();
    });
  });
};