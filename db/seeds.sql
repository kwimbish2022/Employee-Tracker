USE employee_trackerDB;

INSERT INTO department (name)
VALUES
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO role (title, salary, department_id)
VALUES
("Sales Lead", 110000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 120000, 2),
("Account Manager", 160000, 3),
("Accountant", 125000, 3),
("Legal Team Lead", 250000, 4),
("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Kathy", "Wimbish", 1, 1),
("Mike", "Chan", 1, 1),
("Ashley", "Rodriguez", 2, 2),
("Kevin", "Tupik", 2, 1),
("Kunal", "Singh", 3, 1),
("Malia", "Brown", 3, 2),
("Sarah", "Lourd", 4, 2),
("Toa", "Allen", 4, 1);