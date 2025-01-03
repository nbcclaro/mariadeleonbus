const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update with your MySQL password
    database: 'bus_seat_reservation'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the MySQL database.');
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint to get available seats
app.post('/getSeats', (req, res) => {
    const { date, time } = req.body;
    const query = 'SELECT * FROM seats WHERE date = ? AND time = ?';
    db.query(query, [date, time], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Endpoint to reserve a seat
app.post('/reserveSeat', (req, res) => {
    const { date, time, seatNumber } = req.body;
    const checkQuery = 'SELECT * FROM seats WHERE date = ? AND time = ? AND seatNumber = ?';
    db.query(checkQuery, [date, time, seatNumber], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0 && results[0].reserved) {
            return res.json({ success: false, message: 'Seat is already reserved.' });
        }

        const reserveQuery = 'INSERT INTO seats (date, time, seatNumber, reserved) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE reserved = VALUES(reserved)';
        db.query(reserveQuery, [date, time, seatNumber, true], (err, results) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});