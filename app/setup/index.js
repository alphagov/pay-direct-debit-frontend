'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')
const {validateAndRefreshCsrf, ensureSessionHasCsrfSecret} = require('../../common/middleware/csrf')
const {ensureSessionHasPaymentRequest} = require('../../common/middleware/get-payment-request')
const getGatewayAccount = require('../../common/middleware/get-gateway-account').middleware

// Initialisation
const router = express.Router()
const indexPath = '/setup/:paymentRequestExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, ensureSessionHasPaymentRequest, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, getGatewayAccount, getController)
router.post(paths.index, ensureSessionHasPaymentRequest, validateAndRefreshCsrf, getGatewayAccount, postController)

// Export
module.exports = {
  router,
  paths
}
