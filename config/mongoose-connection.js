const mongoose = require("mongoose")

 function Dbconnection(url){
    mongoose.connect(`${url}/Twitter-APIs`).then(()=>{
        console.log(`Connected to ${url} successfully`)
    }).catch((err)=>{
        console.log("Error connecting to MongoDB",err)
    })
}

module.exports = {Dbconnection}