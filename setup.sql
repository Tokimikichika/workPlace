USE mydatabase;

CREATE TABLE IF NOT EXISTS Clients (
    AccountNumber INT AUTO_INCREMENT PRIMARY KEY,
    LastName VARCHAR(255) NOT NULL,
    FirstName VARCHAR(255) NOT NULL,
    MiddleName VARCHAR(255),
    BirthDate DATE,
    INN VARCHAR(20),
    ResponsiblePerson VARCHAR(255),
    Status ENUM('Не в работе', 'В работе', 'Отказ', 'Сделка закрыта') DEFAULT 'Не в работе'
);

INSERT INTO Clients (LastName, FirstName, MiddleName, BirthDate, INN, ResponsiblePerson, Status)
VALUES
    ('Иванов', 'Иван', 'Иванович', '1990-01-01', '123456789012', 'Мария Иванова', 'Не в работе'),
    ('Петров', 'Петр', 'Петрович', '1985-02-02', '987654321098', 'Мария Иванова', 'В работе');

CREATE TABLE IF NOT EXISTS Users (
    FullName VARCHAR(255) NOT NULL,
    Login VARCHAR(50) PRIMARY KEY,
    PasswordHash VARCHAR(255) NOT NULL
);

INSERT INTO Users (FullName, Login, PasswordHash)
VALUES
    ('Мария Иванова', 'myuser', '$2b$10$Lm3aFIg81dldGHRqns8zyuentZYlwRkItPxCEhcwcdqaGkM/0fz4q');
