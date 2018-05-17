'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const postController = require('./post.controller')

// Initialisation
const router = express.Router()
const indexPath = '/request-denied'
const paths = {
  index: indexPath
}

// Routing
router.post(paths.index, postController)

// Export
module.exports = {
  router,
  paths
}
