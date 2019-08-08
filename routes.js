const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('index')
})
router.get('/urlss', (req, res) => {
  res.render('urlss')
})
router.get('/:id', (req, res) => {
  res.render('all')
})
module.exports = router
