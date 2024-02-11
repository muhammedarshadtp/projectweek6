const express = require('express')
const collection = require('../src/mongodb')
const bcrypt = require("bcrypt")

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
        res.render('signup')
    }


})
router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name)
    console.log(collection)
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const password = hashPassword
        // Create a new user
        const collections = new collection({ email, password, name });
        // Save the user to the database
        await collections.save();
        console.log({ name, email, hashPassword });
        console.log(hashPassword)
        res.redirect('/login')
    } catch (error) {


    }
});
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/home')
    } else {
        res.render('login')
    }

})

router.post('/login', async (req, res) => {
    const collect = await collection.findOne({ email: req.body.email })
    const password = await collection.findOne({ password: collect.password })
    console.log(collect, password)

    if (collect.email === req.body.email) {
        const result = bcrypt.compare(req.body.password, password.password)
        if (result) {
            req.session.userName = collect.name
                req.session.user = true
            res.redirect('/home')
        }
        else {
            res.redirect('/login')
        }
    } else {
        res.redirect('/login')
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