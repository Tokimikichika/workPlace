const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');

const app = express();

// Подключение к базе данных
const pool = mysql.createPool({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const sessionStore = new MySQLStore({
    expiration: 86400000,
    endConnectionOnClose: true
}, pool);

app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Роуты

// Главная страница с формой авторизации
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
});

// Авторизация пользователя
app.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(`Received login attempt for username: ${username}`);
    
    if (username && password) {
        pool.query('SELECT * FROM Users WHERE Login = ?', [username], (err, results, fields) => {
            if (err) {
                console.error("Error while executing query:", err);
                res.send('An error occurred');
                return;
            }
            if (results && results.length > 0) {
                const user = results[0];
                console.log(`User found: ${JSON.stringify(user)}`);
                bcrypt.compare(password, user.PasswordHash, (err, bcryptResult) => {
                    if (err) {
                        console.error("Error while comparing passwords:", err);
                        res.send('An error occurred');
                        return;
                    }
                    if (bcryptResult) {
                        console.log("Password match, logging in.");
                        req.session.loggedin = true;
                        req.session.username = username;
                        req.session.fullname = user.FullName;
                        res.redirect('/home');
                    } else {
                        console.error("Incorrect Username and/or Password!");
                        res.send('Incorrect Username and/or Password!');
                    }
                    res.end();
                });
            } else {
                console.error("Incorrect Username and/or Password!");
                res.send('Incorrect Username and/or Password!');
                res.end();
            }
        });
    } else {
        console.error("Please enter Username and Password!");
        res.send('Please enter Username and Password!');
        res.end();
    }
});

// Домашняя страница пользователя
app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        pool.query('SELECT * FROM Clients WHERE ResponsiblePerson = ?', [req.session.fullname], (err, results, fields) => {
            if (err) {
                console.error("Error while executing query:", err);
                res.send('An error occurred');
                return;
            }
            res.send(renderHomePage(req.session.username, req.session.fullname, results)); // Передаем также fullName
        });
    } else {
        res.send('Please login to view this page!');
    }
});

// Обновление статуса клиента
app.post('/update_status', (req, res) => {
    if (req.session.loggedin) {
        const accountNumber = req.body.account_number;
        const status = req.body.status;
        console.log(`Updating status for account number: ${accountNumber} to ${status}`);
        
        pool.query('UPDATE Clients SET Status = ? WHERE AccountNumber = ?', [status, accountNumber], (err, results, fields) => {
            if (err) {
                console.error("Error while updating status:", err);
                res.send('An error occurred');
                return;
            }
            console.log(`Status updated successfully for account number: ${accountNumber}`);
            res.send('Status updated successfully');
        });
    } else {
        res.send('You are not logged in');
    }
});

// Выход из системы
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Слушаем порт 4000
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});

// Function to render home page
function renderHomePage(username, fullName, clients) {
    let clientRows = '';
    clients.forEach(client => {
        clientRows += `
            <tr>
                <td>${client.AccountNumber}</td>
                <td>${client.LastName}</td>
                <td>${client.FirstName}</td>
                <td>${client.MiddleName}</td>
                <td>${client.BirthDate}</td>
                <td>${client.INN}</td>
                <td>${client.ResponsiblePerson}</td>
                <td>${client.Status}</td>
                <td>
                    <select class="status-select" data-account="${client.AccountNumber}">
                        <option value="Не в работе" ${client.Status === 'Не в работе' ? 'selected' : ''}>Не в работе</option>
                        <option value="В работе" ${client.Status === 'В работе' ? 'selected' : ''}>В работе</option>
                        <option value="Отказ" ${client.Status === 'Отказ' ? 'selected' : ''}>Отказ</option>
                        <option value="Сделка закрыта" ${client.Status === 'Сделка закрыта' ? 'selected' : ''}>Сделка закрыта</option>
                    </select>
                </td>
            </tr>
        `;
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Home</title>
        <link rel="stylesheet" type="text/css" href="/styles.css">
    </head>
    <body>
        <div class="container">
            <h2>Welcome, ${username}</h2>
            <a class="button" href="/logout">Logout</a>
    
            <div class="client-table">
                <h3>Таблица клиентов</h3>
                <table border="1">
                    <tr>
                        <th>Номер счета</th>
                        <th>Фамилия</th>
                        <th>Имя</th>
                        <th>Отчество</th>
                        <th>Дата рождения</th>
                        <th>ИНН</th>
                        <th>ФИО ответственного</th>
                        <th>Статус</th>
                    </tr>
                    ${clientRows}
                </table>
            </div>
    
            <div class="user-table">
                <h3>Таблица пользователей</h3>
                <table border="1">
                    <tr>
                        <th>ФИО</th>
                        <th>Логин</th>
                        <th>Пароль</th>
                    </tr>
                    <tr>
                        <td>${fullName}</td>
                        <td>${username}</td>
                        <td>**********</td>
                    </tr>
                </table>
            </div>
        </div>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
            $(document).ready(function() {
                $('.status-select').change(function() {
                    var accountNumber = $(this).data('account');
                    var status = $(this).val();
                    console.log('Sending update for account number: ' + accountNumber + ' to status: ' + status);
    
                    $.post('/update_status', {
                        account_number: accountNumber,
                        status: status
                    }, function(response) {
                        alert(response);
                    });
                });
            });
        </script>
    </body>
    </html>
    `;
}
