const express = require('express')
const router = express.Router()

// bring in models
let Article = require('../models/article')
let User = require('../models/user')

// add article route
router.get('/add', ensureAutenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add article'
  })
})
// add submit POST route
router.post('/add', (req,res) => {
  req.checkBody('title', 'Title is required').notEmpty()
  // req.checkBody('author', 'Author is required').notEmpty()
  req.checkBody('body', 'Body is required').notEmpty()
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
    article.author = req.user._id
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
// get single article editing
router.get('/edit/:id',ensureAutenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id) {
      req.flash('danger', 'Noth authorized')
      res.redirect('/')
    } else {
      res.render('edit_article', {
        article: article
      })
    }
  })
})
// update submit POST route
router.post('/edit/:id', ensureAutenticated, (req,res) => {
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
router.delete('/:id', (req, res) => {
  if(!req.user._id) {
    res.status(500).send()
  }
  let query = {_id: req.params.id}
  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id) {
      res.status(500).send()
    } else {
      Article.remove(query, (err) => {
        if(err) {
          console.log(err)
        } else {
          req.flash('success', 'Article deleted')
          res.send('Success')
        }
      })
    }
  })
})
// get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      })
    })
  })
})
// access control
function ensureAutenticated(req, res, next) {
  if(req.isAuthenticated()){
    return next()
  } else {
    req.flash('danger', 'Please login')
    res.redirect('/users/login')
  }
  
}

module.exports = router