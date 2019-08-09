const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('index')
})
router.get('/link', (req, res) => {
  res.render('link')
})
router.get('/api/:id', (req, res) => {
  res.render('all')
})
module.exports = router
