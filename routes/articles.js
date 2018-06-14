const express = require('express')
const router = express.Router()

// bring in models
let Article = require('../models/article')

// add article route
router.get('/add', (req, res) => {
  res.render('add_article', {
    title: 'Add article'
  })
})
// add submit POST route
router.post('/add', (req,res) => {
  req.checkBody('title', 'Title is required').notEmpty()
  req.checkBody('author', 'Author is required').notEmpty()
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
// get single article editing
router.get('/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('edit_article', {
      article: article
    })
  })
})
// update submit POST route
router.post('/edit/:id', (req,res) => {
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
  let query = {_id: req.params.id}
  Article.remove(query, (err) => {
    if(err) {
      console.log(err)
    } else {
      req.flash('success', 'Article deleted')
      res.send('Success')
    }
  })
})
// get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('article', {
      article: article
    })
  })
})

module.exports = router