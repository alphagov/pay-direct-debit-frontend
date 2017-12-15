'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getIndexController = require('./index-get.controller')

// Initialisation
const router = express.Router()
const indexPath = '/'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, getIndexController)

// Export
module.exports = {
  router,
  paths
}
