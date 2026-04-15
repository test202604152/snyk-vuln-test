// Intentionally vulnerable app for Snyk testing
const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const app = express();

const db = mysql.createConnection({ host: 'localhost', user: 'root', database: 'app' });

// SQL injection - CWE-89
app.get('/user', (req, res) => {
    const userId = req.query.id;
    const sql = "SELECT * FROM users WHERE id = '" + userId + "'";
    db.query(sql, (err, rows) => {
          if (err) return res.status(500).send(err.message);
          res.send(rows);
    });
});

// Command injection - CWE-78
app.get('/ping', (req, res) => {
    const host = req.query.host;
    exec('ping -c 1 ' + host, (err, stdout) => {
          if (err) return res.status(500).send(err.message);
          res.send(stdout);
    });
});

// Path traversal - CWE-22
app.get('/read', (req, res) => {
    const filename = req.query.file;
    const content = fs.readFileSync(path.join('/var/data', filename), 'utf8');
    res.send(content);
});

// Reflected XSS - CWE-79
app.get('/hello', (req, res) => {
    const name = req.query.name;
    res.send('<h1>Hello ' + name + '</h1>');
});

// Hardcoded secret - CWE-798
const API_KEY = 'sk_live_abcdef1234567890deadbeefcafebabe';

app.listen(3000, () => console.log('listening on 3000 with key ' + API_KEY));
