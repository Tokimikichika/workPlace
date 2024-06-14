# Инструкция по установке и запуску базы данных MariaDB

# git@github.com:Tokimikichika/workPlace.git

## Установка MariaDB

1. Обновите списки пакетов и установите MariaDB:

    ```bash
    sudo apt update
    sudo apt install mariadb-server
    ```

2. Запустите службу MariaDB и добавьте её в автозапуск:

    ```bash
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    ```

3. Запустите скрипт настройки безопасности:

    ```bash
    sudo mysql_secure_installation
    ```

    Следуйте инструкциям на экране для установки пароля root и настройки других параметров безопасности.

## Настройка базы данных

1. Подключитесь к MariaDB с помощью команды:

    ```bash
    sudo mysql -u root -p
    ```

    Введите пароль, который вы установили во время настройки безопасности.

2. Выполните следующий SQL-скрипт для создания базы данных и пользователя:

    ```sql
    CREATE DATABASE IF NOT EXISTS mydatabase;
    USE mydatabase;

    CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'mypassword';
    GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'localhost';
    FLUSH PRIVILEGES;
    ```

3. Создайте таблицы и заполните их данными. Выполните следующий SQL-скрипт:

    ```sql
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
        ('Иванов', 'Иван', 'Иванович', '1990-07-01', '123456789012', 'Мария Иванова', 'Не в работе'),
        ('Сидоров', 'Иван', 'Иванович', '1981-01-01', '123456789012', 'Мария Иванова', 'Не в работе'),
        ('Петров', 'Петр', 'Петрович', '1985-02-02', '987654321098', 'Мария Иванова', 'В работе'),
        ('Логман', 'Семен', 'Петрович', '1985-02-02', '987654321098', 'Мария Иванова', 'В работе');

    CREATE TABLE IF NOT EXISTS Users (
        FullName VARCHAR(255) NOT NULL,
        Login VARCHAR(50) PRIMARY KEY,
        PasswordHash VARCHAR(255) NOT NULL
    );

    INSERT INTO Users (FullName, Login, PasswordHash)
    VALUES
        ('Мария Иванова', 'myuser', '$2b$10$Lm3aFIg81dldGHRqns8zyuentZYlwRkItPxCEhcwcdqaGkM/0fz4q');
    ```

4. Выйдите из интерфейса MariaDB:

    ```sql
    exit;
    ```

## Настройка Node.js приложения

1. Установите Node.js и npm:

    ```bash
    sudo apt install nodejs npm
    ```

2. Перейдите в директорию вашего проекта:

    ```bash
    cd /path/to/your/project
    ```

3. Установите необходимые зависимости:

    ```bash
    npm install
    ```

4. Запустите `add_user.js` для добавления пользователя в базу данных:

    ```bash
    node add_user.js
    ```

5. Запустите ваше Node.js приложение:

    ```bash
    node app.js
    ```

## Открытие приложения в браузере

1. Откройте браузер и перейдите по адресу:

    ```plaintext
    http://localhost:4000
    login: myuser
    password: mypassword
    ```

Теперь ваше приложение должно быть доступно и готово к использованию.
