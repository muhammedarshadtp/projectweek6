const express = require("express")
const bcrypt = require("bcrypt")

const collection = require('../src/mongodb')
const { render, name } = require("ejs")
const {isValidEmail, isValidName }= require("../utils/validation")


console.log(collection)

const router = express.Router()
 
router.get('/admin', (req, res) => {
    if(req.session.admin){
    res.redirect("/adminhome")
    }else{
        res.render('admin',{msg:""})
    }

})
router.post('/admin', async (req, res) => {

    try {
        const {email,password} = req.body;
        const adminDetails = await collection.findOne({ email: email})
        console.log(adminDetails);
       if ( !adminDetails) {
            res.render('admin',{msg:"Invalid email"})
    }
    if(adminDetails){
        const spassword = adminDetails.password

        if(spassword){

            const result = await bcrypt.compare(password, spassword)
          console.log(result)
                 if(result && adminDetails.isAdmin===true){

                 req.session.admin=true
                 res.redirect('/adminhome')
             }else{
                res.render('admin',{msg:"Invalid Password "})
             } 
        }  
        
            else{
                res.render('admin',{msg:"Invalid Password"})
            }
    } 
    } catch (error) {
        console.log(error, 'admin login error')
    }
})
router.get('/adminhome', (req, res) => {
    if(req.session.admin){
     res.render('adminhome')
}else{
    res.redirect('/admin')
}

})
router.get('/users',async(req,res)=>{
    if(req.session.admin){
        let users = await collection.find({isAdmin:false}).sort({_id:-1})
        console.log(users)
        res.render('userList',{users:users})
    }else{
        res.redirect('/admin')
    }

})
router.get('/adduser',(req,res)=>{
        res.render('adminadduser',{msg:""})
})
router.post('/adduser',async(req,res)=>{
    const { email, password, name } = req.body;
    console.log(email, password, name)
    console.log(collection)
    try {
        if(!isValidEmail(email)) {

            return res.render('adminadduser', { msg: "Invalid email format" });
        }

        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const password = hashPassword
         // Check if user already exists with the provided email
         const existingUser = await collection.findOne({ email });
         if (existingUser) {
             // User with the provided email already exists
              return res.render('adminadduser',{msg:"Email already exists"});
         }
        // Create a new user
        const collections = new collection({ email, password, name });
        // Save the user to the database
        await collections.save();
        console.log({ name, email, hashPassword });
        console.log(hashPassword)
         
        res.redirect('/users')
         
    } catch (error) {}
});
router.post('/admin-userSearch', async (req,res)=>{
    
    const searchUser = req.body.search

        const searchedUsers = await collection.find({name:{$regex:new RegExp(`${searchUser}`,'i')},isAdmin:false})

        if(searchedUsers !== null){
            res.render('userList',{users:searchedUsers})
        }else {

        }

})
router.get('/update',async(req,res)=>{
    console.log(req.query.email)
    const updateUserEmail = req.query.email
    req.session.userEmail = req.query.email
   const updateUserDetalis = await collection.findOne({email:updateUserEmail}) 
        res.render('updateUser',{updateUser:updateUserDetalis})
})
router.post('/updateUser',async(req,res)=>{
    const {name}=req.body
    
    try {
        const oldData = req.session.userEmail
        await collection.updateOne({email:oldData},{$set:{name:name}})
        req.session.username=name
        res.redirect('/users')
    } catch (error) {
        console.log(error)
    }}) 


router.get('/delete',async(req,res)=>{
    const searchedUserEmail = req.query.email
    console.log(searchedUserEmail)
    await collection.deleteOne({email:searchedUserEmail})
    res.redirect('/users')

})

router.get('/signout',(req,res)=>{
    delete req.session.admin
    res.redirect('/admin')
})

module.exports = router