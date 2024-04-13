const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

const app = express();

const port = 3000;

// Database connection configuration
const dbConfig = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'nani'
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);


const csvFilePath = './usersdata.csv';

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', async (row) => {
    try {
        const connection = await pool.getConnection();
        const headers = Object.keys(row);
        // Generate SQL schema based on the headers
        const columns = headers.map(header => `\`${header}\` VARCHAR(255)`).join(', ');
        const createTableQuery = `CREATE TABLE IF NOT EXISTS Nani (${columns})`;

        // Execute the create table query
        await connection.query(createTableQuery);
        connection.release();

        const insertQuery = `
                        INSERT INTO Nani (${headers.map(header => `\`${header}\``).join(', ')}) 
                        VALUES (${headers.map(() => '?').join(', ')})`;

                    const values = headers.map(header => row[header]);

                    const insertConnection = await pool.getConnection();
                    await insertConnection.query(insertQuery, values);
                    insertConnection.release();
    } catch (error) {
      console.error('Error processing data:', error);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
});

app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const sql = 'SELECT * FROM Nani';

        const [rows, fields] = await connection.query(sql);
        connection.release();

        res.json(rows);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});