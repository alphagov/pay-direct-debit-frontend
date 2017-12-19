'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')

// Initialisation
const router = express.Router()
const indexPath = '/setup'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, getController)
router.post(paths.index, postController)

// Export
module.exports = {
  router,
  paths
}
