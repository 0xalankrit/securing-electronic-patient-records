const express = require('express');
const connection =require('./mongo-db/connection.js')
const users = require('./mongo-db/user-model.js')
const mongoose = require('mongoose');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require("./middleware/auth");


require('dotenv').config()

const app = express();
const PORT= 4000

connection();
app.use(express.json({extended:false}));

app.get('/',async function(req, res,next){
    res.send('Hello stranger')
})

app.post('/register',async function(req, res, next){    
    try {
        const {username,password} =req.body;
        if(!username && !password){
            res.status(400).send('All input required');
        }
        const oldUser = await users.findOne({username: username});
        if(oldUser){
            res.status(400).send('User already exists')
        }
        encryptedPassword = await bcrypt.hash(password, 10);
        const newuser = await users.create({
            username,
            password: encryptedPassword,
          });
        const token = jwt.sign(
            { 
                user_id: newuser._id,
                username
            },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
        newuser.token = token;
        await newuser.save();
        res.status(201).json(newuser);
    } catch (error) {
        console.log(error)
    }
})

app.post('/login',auth,async function(req, res, next){
    try {
        const {username,password} = req.body;
        if (!(username && password)) {
            res.status(400).send("All input is required");
        }
        const newuser = await users.findOne({ username });
            if (newuser && (await bcrypt.compare(password, newuser.password))) {
                const token = jwt.sign(
                { 
                    user_id: newuser._id,
                    username 
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            newuser.token = token;
            await newuser.save();
            res.status(200).json(newuser);
        }
        res.status(400).send("Invalid Credentials");
    } catch (error) {
        console.log(error)
    }

})

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});
  
app.listen(PORT, function (){
    
    console.log(`listening on http://localhost:${PORT}`)
})