const express = require('express');
const mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'sql12.freesqldatabase.com',
    user     : 'sql12726654',
    password : 'Ws5pQrbgmv',
    database : 'sql12726654'
  });

db.connect((err)=>{
    if(err){
        throw err
    }
    console.log('database connected')
});

const app = express();

app.get('/createtable', (req, res)=>{
    let sql = 'CREATE TABLE posts( userID int PRIMARY KEY, favorite text)'
    db.query(sql, (err, result)=>{
        if(err) throw err;
        console.log(result);
        res.send('Post table created...');  
    })
})

app.get('/addpost', (req, res) => {
    let userID = 1234;
    let favorite = 'nyakak';
    let sql = 'INSERT INTO posts (userID, favorite) VALUES (?, ?)';
    db.query(sql, [userID, favorite], (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Added post...');
    });
});

app.listen('3000', ()=>{
    console.log('port running at 3000')
})