const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator')
const flash = require('connect-flash')

// conect to database
mongoose.connect('mongodb://localhost/expressdb')
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
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// express messages middelware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
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

// add article route
app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    title: 'Add article'
  })
})

// add submit POST route
app.post('/articles/add', (req,res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // get errors if any
  let errors = req.validationErrors()
  if(errors) {
    res.render('add_article', {
      title: 'Add article',
      errors:errors
    })
  } else {
    let article = new Article()
    article.title = req.body.title
    article.author = req.body.author
    article.body = req.body.body
    article.save((err) => {
      if(err) {
        console.log(err)
      } else {
        req.flash('success', 'Article Added')
        res.redirect('/')
      }
    })
  }
})
// get single article
app.get('/article/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('article', {
      article: article
    })
  })
})
// get single article editing
app.get('/article/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('edit_article', {
      article: article
    })
  })
})

// update submit POST route
app.post('/articles/edit/:id', (req,res) => {
  let article = {}
  article.title = req.body.title
  article.author = req.body.author
  article.body = req.body.body
  let query = {_id:req.params.id}
  Article.update(query, article, (err) => {
    if(err) {
      console.log(err)
    } else {
      req.flash('success', 'Article Updated')
      res.redirect('/')
    }
  })
})
// delete article
app.delete('/article/:id', (req, res) => {
  let query = {_id: req.params.id}
  Article.remove(query, (err) => {
    if(err) {
      console.log(err)
    } else {
      req.flash('success', 'Article Added')
      res.send('Success')
    }
  })
})
// start server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000...')
})