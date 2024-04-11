const express = require('express');
const mysql = require('mysql2');
const app = express();

const port = 3000;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bussinessquant'
});

app.get('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error while connecting to database:", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        connection.query("SELECT * FROM bussinessquant LIMIT 20", (err, result) => {
            connection.release(); // Release the connection back to the pool

            if (err) {
                console.error("Error while fetching data:", err);
                res.status(500).send("Internal Server Error");
                return;
            }

            res.json(result);
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
