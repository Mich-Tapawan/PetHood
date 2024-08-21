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

// // Delete or add record
app.post('/getUser', (req, res) => {
    let {userID, favorite, state} = req.body;
    let {displayName, address, lat, lon} = favorite;
    console.log('Request body:', req.body);

    let sql = 'SELECT * FROM details where user_id = ?';
    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if(state){
            let delsql = 'DELETE FROM details WHERE shop_name = ?';
            db.query(delsql, [displayName], (err, result)=>{
                if(err){
                    console.log(err);
                    res.status(500).send('server error');
                    return;
                }
                if (result.affectedRows > 0) {
                    res.json({ message: 'Post deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Post not found' });
                }
            })
        }
        else{
            let addsql = 'INSERT INTO details (user_id, shop_name, address, lat, lon) VALUES (?, ?, ?, ?, ?)';
            db.query(addsql, [userID, displayName, address, lat, lon], (err, result) =>{
                if (err) {
                    console.error(err);
                    res.status(500).send('Server error');
                    return;
                }
                res.json({ message: 'Post added successfully' });
            });
        }
    });
});

app.listen('3000', ()=>{
    console.log('port running at 3000')
})