const express = require('express')
const collection = require('../src/mongodb')
const bcrypt = require("bcrypt")
const {isValidEmail, isValidName }= require("../utils/validation")

console.log(collection)

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home')
    } else {
        res.redirect('/login')
    }

})
router.get('/signup', (req, res) => {
    if (req.session.user) {
        res.redirect('/login')
    } else {
        res.render('signup',{msg:""})
    }


})
router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name)
    console.log(collection)
    try {
       
        // Validate name
        if (!isValidName(name)) {

            return res.render('signup', { msg: "Name is invalid" });

        } if(!isValidEmail(email)) {

            return res.render('signup', { msg: "Invalid email format" });
        }
    
        
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const password = hashPassword
         // Check if user already exists with the provided email
         const existingUser = await collection.findOne({ email });
         if (existingUser) {
             // User with the provided email already exists
              return res.render('signup',{msg:"Email already exists"});
         }
        // Create a new user
        const collections = new collection({ email, password, name });
        // Save the user to the database
        await collections.save();
        console.log({ name, email, hashPassword });
        console.log(hashPassword)
         
        res.redirect('/login')
         
    } catch (error) {}
});
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/home')
    } else {
        res.render('login',{msg:""})
    }
})
router.post('/login', async (req, res) => {
    try {
        const collect = await collection.findOne({ email: req.body.email });

        if (!collect) {
            // If no user found with the provided email
             res.render('login', {msg: "Incorrect email " });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, collect.password);

        if (!passwordMatch) {
            // If password does not match
             res.render('login', {msg:"Incorrect  password" });
        }

        // Successful login
        req.session.userName = collect.name;
        req.session.user = true;
        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        
    }
})

router.get('/home', (req, res) => {
    if (req.session.user) {
        const userName = req.session.userName
        res.render('home',{userName:userName})
    } else {
        res.redirect('/login')
    }

})
router.get('/logout', (req, res) => {
    delete req.session.user
    res.redirect('/')
})
module.exports = router