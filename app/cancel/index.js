'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const {validateAndRefreshCsrf} = require('../../common/middleware/csrf')
const {ensureSessionHasPaymentRequest} = require('../../common/middleware/get-payment-request')
const getGatewayAccount = require('../../common/middleware/get-gateway-account').middleware

// Initialisation
const router = express.Router()
const indexPath = '/cancel/:paymentRequestExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, ensureSessionHasPaymentRequest, validateAndRefreshCsrf, getGatewayAccount, getController)

// Export
module.exports = {
  router,
  paths
}
