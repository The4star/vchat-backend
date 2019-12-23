const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');

// config 

require('dotenv').config()

// app requirements
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors())
app.use(session({
    secret: process.env.SEEK,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// routes
const dfRoute = require('./routes/dialogFlowRoutes');

app.use('/', dfRoute);

module.exports = app;