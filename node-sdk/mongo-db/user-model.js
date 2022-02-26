const { Schema,model } =require('mongoose');

const userSchema =new Schema({
    username: {type: String},
    password: {type: String},
    token: {type: String}
});

const users = model('users',userSchema);
module.exports = users;