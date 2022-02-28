'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const util = require('util');
const express = require('express');

const constants = require('./config/constants.json')
const jwt =require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config()


const helper = require('./helper/helper')
const invoke = require('./helper/invoke')
const query = require('./helper/query')


const host = process.env.HOST || constants.host;
const PORT = process.env.PORT || constants.port;

const app = express();

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.json({extended:false}));


logger.level = 'debug';


// -0-0-0-0-0- JWT VERIFY MIDDLEWARE -0-0-0-0-0-

const auth = (req, res, next)=>{
    const token =
    req.body.token || req.query.token || req.headers["access-token"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(`Error ================:${err}`)
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            return;
        } else {
            req.username = decoded.username;
            req.orgname = decoded.orgName;
            logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
            return next();
        }
    });
}


function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

// --------------------------------------------- //
// START THE SERVER BY RUNNING NODEMON SERVER.JS //
// --------------------------------------------- //

app.listen(PORT, function (){
    console.log(`listening on http://localhost:${PORT}`)
})

app.get('/',auth,async function(req, res,next){
    res.send('Hello stranger')
})


app.post('/users', async function (req, res) {
    var username = req.body.username;
    var orgName = req.body.orgName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName
    }, process.env.SECRET_KEY);

    let response = await helper.getRegisteredUser(username, orgName, true);

    logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
    if (response && typeof response !== 'string') {
        logger.debug('Successfully registered the username %s for organization %s', username, orgName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
        res.json({ success: false, message: response });
    }
});

app.post('/register', async function (req, res) {
    var username = req.body.username;
    var orgName = req.body.orgName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName
    }, process.env.SECRET_KEY);

    console.log(token)

    let response = await helper.registerAndGerSecret(username, orgName);

    logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
    if (response && typeof response !== 'string') {
        logger.debug('Successfully registered the username %s for organization %s', username, orgName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
        res.json({ success: false, message: response });
    }

});

// Login and get jwt
app.post('/users/login', async function (req, res) {
    var username = req.body.username;
    var orgName = req.body.orgName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName
    }, process.env.SECRET_KEY);

    let isUserRegistered = await helper.isUserRegistered(username, orgName);

    if (isUserRegistered) {
        res.json({ success: true, message: { token: token } });

    } else {
        res.json({ success: false, message: `User with username ${username} is not registered with ${orgName}, Please register first.` });
    }
});

// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName',auth, async function (req, res) {
    try {
        logger.debug('==================== INVOKE ON CHAINCODE ==================');
        var peers = req.body.peers;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;

        // var transient = req.body.transient;
        // console.log(`Transient data is ;${transient}`)
        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : ' + fcn);
        logger.debug('args  : ' + args);
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        let message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.username, req.orgname);
        console.log(`message result is : ${message}`)

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }
        res.send(response_payload);

    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

//  Query chaincode
app.get('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');

        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        let peer = req.query.peer;
        // console.log(chaincodeName)
        // console.log(channelName)
        // console.log(fcn)
        // console.log(args)
        // console.log(peer);

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
        console.log('args==========', args);
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);

        let message = await query.query(channelName, chaincodeName, args, fcn, req.username, req.orgname);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});
















// app.post('/register',async function(req, res, next){    
//     try {
//         const {username,password} =req.body;
//         if(!username && !password){
//             res.status(400).send('All input required');
//         }
//         const oldUser = await users.findOne({username: username});
//         if(oldUser){
//             res.status(400).send('User already exists')
//         }
//         encryptedPassword = await bcrypt.hash(password, 10);
//         const newuser = await users.create({
//             username,
//             password: encryptedPassword,
//           });
//         const token = jwt.sign(
//             { 
//                 user_id: newuser._id,
//                 username
//             },
//             process.env.TOKEN_KEY,
//             {
//               expiresIn: "2h",
//             }
//           );
//         newuser.token = token;
//         await newuser.save();
//         res.status(201).json(newuser);
//     } catch (error) {
//         console.log(error)
//     }
// })

// app.post('/login',async function(req, res, next){
//     try {
//         const {username,password} = req.body;
//         if (!(username && password)) {
//             res.status(400).send("All input is required");
//         }
//         const newuser = await users.findOne({ username });
//             if (newuser && (await bcrypt.compare(password, newuser.password))) {
//                 const accessToken = jwt.sign(
//                 { 
//                     user_id: newuser._id,
//                     username 
//                 },
//                 process.env.TOKEN_KEY
//                 ,
//                 {
//                     expiresIn: "20000",
//                 }
//             );
//             newuser.token = accessToken;
//             res.status(200).json(newuser);
//         }
//         res.status(400).send("Invalid Credentials");
//     } catch (error) {
//         console.log(error)
//     }

// })

// app.post('/refresh', function(req, res) {
//     const refreshToken =req.body.token;
//     if(!refreshToken) res.status(401).json('You are not authenticated')

// })


// app.post("/welcome", auth, (req, res) => {
//     res.status(200).send("Welcome 🙌 ");
// });
  
