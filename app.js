const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const passport = require('passport')
const config = require('./config/database')

// conect to database
mongoose.connect(config.database)
let db = mongoose.connection

//check connection
db.once('open', () => {
  console.log('Connected to mongodb')
})
// check for db errors
db.on('error', (err) => {
  console.log(err)
})

// init app
const app = express()

// bring in models
let Article = require('./models/article')

// load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// set folder for static files
app.use(express.static(path.join(__dirname, 'public')))

// express session middleware
app.use(session({
  secret: '🐈',
  resave: true,
  saveUninitialized: true
}))

// express messages middelware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
})

// express validator middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}))

// passport config
require('./config/passport')(passport)
// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// global user variable
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null
  next()
})
// home route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err)
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      })
    }
  })
})
// routee files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)
// start server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000...')
})