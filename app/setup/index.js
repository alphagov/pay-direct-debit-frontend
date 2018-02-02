'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')
const {validateAndRefreshCsrf, ensureSessionHasCsrfSecret} = require('../../common/middleware/csrf')

// Initialisation
const router = express.Router()
const indexPath = '/setup/:paymentRequestExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, getController)
router.post(paths.index, validateAndRefreshCsrf, postController)

// Export
module.exports = {
  router,
  paths
}
