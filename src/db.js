const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

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
app.use(cors());
app.use(express.json());

// Checks if the userID already exists
app.post('/getUser', (req, res) => {
    let {userID, favorite, state} = req.body;
    let {displayName, address, lat, lon} = favorite;
    console.log(userID)
    console.log(state)
    console.log(displayName )
    console.log(address)
    console.log(lat)
    console.log(lon)

    let sql = 'SELECT * FROM details where user_id = ?';
    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        // Creates a new user instance
        let addsql = 'INSERT INTO details (user_id, shop_name, address, lat, lon) VALUES (?, ?, ?, ?, ?)';
        db.query(addsql, [userID, displayName, address, lat, lon], (err, result) =>{
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }
            res.send('New post added successfully');
        });
    });
});

app.listen('3000', ()=>{
    console.log('port running at 3000')
})