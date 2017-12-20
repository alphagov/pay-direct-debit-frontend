'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const postController = require('./post.controller')

// Initialisation
const router = express.Router()
const paths = {
  index: '/secure'
}

// Routing
router.post(paths.index, postController)

// Export
module.exports = {
  router,
  paths
}
