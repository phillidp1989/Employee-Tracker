INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal"); 

INSERT INTO role (title, salary, department_id) 
VALUES 
	("Sales Lead", 60000, 1),
	("Salesperson", 35000, 1), 
    ("Lead Engineer", 80000, 2), 
    ("Junior Engineer", 40000, 2), 
    ("Accountant", 60000, 3), 
    ("Finance Assistant", 35000, 3), 
    ("Senior Solicitor", 100000, 4), 
    ("Solicitor", 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
	("Jess", "Coles", 1, null),
    ("Rosie", "Ellis", 2, 1), 
    ("Nova", "Ellis-Phillips", 3, NULL), 
    ("Max", "Pardo-Roques", 4, 3), 
    ("Ben", "Finnemore", 5, NULL), 
    ("Carl", "Williams", 6, 5),
    ("Dan", "Cockerill", 7, null),
    ("Shuli", "Liu", 8, 7); 