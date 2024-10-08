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
app.use(cors({
    origin: 'https://pet-hood.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Add User and update last active
app.post('/identifyUser', (req, res)=>{
    let {userID, curDate} = req.body;
    console.log(req.body);

    let checkSQL = 'SELECT * FROM users WHERE userID = ?';
    db.query(checkSQL, [userID], (err, result)=>{
        if(err){
            console.error(err)
            res.status(404).json({message:'Search error'});
            return;
        }
        if(result.length === 1){
            let updateSQL = 'UPDATE users SET last_active = ? WHERE userID = ?';
            db.query(updateSQL, [curDate, userID], (err, result)=>{
                if(err){
                    console.error(err);
                    res.status(500).json({message:'update server error'});
                    return
                }
                res.json({message:'Updated successfully'});
            })
        }
        else{
            let addUserSQL = 'INSERT INTO users (userID, last_active) VALUES (?, ?)';
            db.query(addUserSQL, [userID, curDate], (err, result)=>{
                if(err){
                    console.error(err);
                    res.status(404).json({message:'add server error'});
                    return
                }
                res.json({message:'user added successfully'});
            })
        }
    })
});

// Delete or add record
app.post('/getUser', (req, res) => {
    let {userID, favorite, state, type} = req.body;
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
            let addsql = 'INSERT INTO details (user_id, shop_name, type, address, lat, lon) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(addsql, [userID, displayName, type, address, lat, lon], (err, result) =>{
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

// Send all favorites from User
app.post('/getFavorites', (req, res)=>{
    let {userID} = req.body
    let getFavSQL = 'SELECT * FROM details WHERE user_id = ?'
    db.query(getFavSQL, [userID], (err, result)=>{
        if(err){
            console.error(err);
            res.status(404).json({message:'Request error'});
            return;
        }
        res.json(result)
    })
})

//Error and disconnection handling
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
        handleDisconnect();
    } else {
        throw err;
    }
});

function handleDisconnect() {
    db = mysql.createConnection(db.config);
    db.connect((err) => {
        if (err) {
            console.error('Error when reconnecting:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Reconnected to database.');
        }
    });
}

app.listen('3000', ()=>{
    console.log('port running at 3000')
})