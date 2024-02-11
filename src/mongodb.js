const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/projectweek6")

.then(()=>{
    console.log("mongosh connected")
})
.catch(()=>{
    console.log("failed connect")
})

const loginschema = new mongoose.Schema({
     email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

const collection = new mongoose.model("ProjectWeek",loginschema)

module.exports=collection