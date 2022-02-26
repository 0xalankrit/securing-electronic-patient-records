const { mongoose } = require('mongoose')
const { ServerApiVersion } = require('mongodb');
const connection =async ()=>{
    const uri =`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.pgevb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(uri,{
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            serverApi: ServerApiVersion.v1
        })
        console.log('Connection successfull !')
    } catch (error) {
        console.log('Connection error',error);
    }

}

module.exports =connection;