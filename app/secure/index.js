'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getAndPostController = require('./get.post.controller')

// Initialisation
const router = express.Router()
const paths = {
  get: '/secure/:chargeTokenId',
  post: '/secure'
}

// Routing
router.get(paths.get, getAndPostController)
router.post(paths.post, getAndPostController)

// Export
module.exports = {
  router,
  paths
}
