'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')

// Initialisation
const router = express.Router()
const indexPath = '/direct-debit-guarantee'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, getController)

// Export
module.exports = {
  router,
  paths
}
