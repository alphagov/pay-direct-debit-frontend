'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getHealthcheckController = require('./healthcheck-get.controller')

// Initialisation
const router = express.Router()
const indexPath = '/healthcheck'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, getHealthcheckController)

// Export
module.exports = {
  router,
  paths
}
