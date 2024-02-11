const express = require("express")
const bcrypt = require("bcrypt")

const collection = require('../src/mongodb')
const { render } = require("ejs")

console.log(collection)

const router = express.Router()
 
router.get('/admin', (req, res) => {
    if(req.session.admin){
    res.redirect("/adminhome")
    }else{
        res.render('admin')
    }

})
router.post('/admin', async (req, res) => {

    try {
        const adminDetails = await collection.findOne({ email: req.body.email })
       if ( adminDetails===null) {
            res.redirect('/admin')
    }
    if(adminDetails !== null){
        const password = adminDetails.password

        if(password !== null){

            const result = await bcrypt.compare(req.body.password, password)
          console.log(password)
                 if(result && adminDetails.isAdmin===true){
                 req.session.admin=true
                 res.redirect('/adminhome')
             }else{
                res.redirect('/admin')
             } 
        } 
        
            else{
                res.redirect('/admin')
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
        let users = await collection.find({isAdmin:false})
        console.log(users)
        res.render('userList',{users:users})
    }else{
        res.redirect('/admin')
    }

})
router.get('/adduser',(req,res)=>{
        res.render('adminadduser')
})
router.post('/admin-userSearch', async (req,res)=>{
    
    const searchUser = req.body.search

        const searchedUsers = await collection.find({name:{$regex:new RegExp(`${searchUser}`,'i')},isAdmin:false})

        if(searchedUsers !== null){
            res.render('userList',{users:searchedUsers})
        }else {

        }

})
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