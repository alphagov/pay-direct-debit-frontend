'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')
const {validateAndRefreshCsrf, ensureSessionHasCsrfSecret} = require('../../common/middleware/csrf')
const {ensureSessionHasPaymentRequest} = require('../../common/middleware/get-payment-request')

// Initialisation
const router = express.Router()
const indexPath = '/setup/:paymentRequestExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, ensureSessionHasPaymentRequest, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, getController)
router.post(paths.index, ensureSessionHasPaymentRequest, validateAndRefreshCsrf, postController)

// Export
module.exports = {
  router,
  paths
}