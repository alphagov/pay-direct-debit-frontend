'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const {validateAndRefreshCsrf} = require('../../common/middleware/csrf')
const checkSecureCookie = require('../../common/middleware/get-payment-request').middleware
const getGatewayAccount = require('../../common/middleware/get-gateway-account').middleware

// Initialisation
const router = express.Router()
const indexPath = '/cancel/:paymentRequestExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, checkSecureCookie, validateAndRefreshCsrf, getGatewayAccount, getController)

// Export
module.exports = {
  router,
  paths
}
