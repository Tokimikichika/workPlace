const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const username = 'myuser';
const password = 'mypassword';  
const fullName = 'My User';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    pool.query('INSERT INTO Users (Login, PasswordHash, FullName) VALUES (?, ?, ?)', [username, hash, fullName], (err, results, fields) => {
        if (err) throw err;
        console.log('User created successfully!');
        pool.end();
    });
});
