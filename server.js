const express = require('express');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./strategies/local');

// Routes
const productRoute = require('./public/product');
const authRoute = require('./auth/auth');

require('./database');

const app = express()
const memoryStore = new session.MemoryStore();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'SADFAASDFASFASDFA',
    resave: false,
    saveUninitialized: false,
    store: memoryStore,
    // store: MongoStore.create({
    //     mongoUrl: 'mongodb://localhost:27017/expressjs',
    // }),
})
);

app.use((req, res, next) =>{
    console.log(`${req.method}:${req.url}`);
    next();
});

app.use((req, res, next) =>{
    console.log(memoryStore);
    next();
});



app.use(passport.initialize());
app.use(passport.session());

app.use('/products',productRoute);
app.use('/users', authRoute);


app.listen(8080, () => {
    console.log('Server is running on port 4000');
});