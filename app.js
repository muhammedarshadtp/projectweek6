// app.js

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const nocache = require('nocache')
const collection=require('./src/mongodb')
const userRouter=require('./router/userRouter')
const adminRouter = require('./router/adminRouter')




const app = express();

app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(nocache()) 

app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true
}));

app.use(userRouter)
app.use(adminRouter)

app.listen(4000, () => {
  console.log("server start");
});
