'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const { validateAndRefreshCsrf } = require('../../common/middleware/csrf/csrf')
const checkSecureCookie = require('../../common/middleware/check-secure-cookie/check-secure-cookie').middleware
const getTransaction = require('../../common/middleware/get-mandate/get-mandate').middleware
const getGatewayAccount = require('../../common/middleware/get-gateway-account/get-gateway-account').middleware

// Initialisation
const router = express.Router()
const indexPath = '/change-payment-method/:mandateExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, checkSecureCookie, validateAndRefreshCsrf, getTransaction, getGatewayAccount, getController)

// Export
module.exports = {
  router,
  paths
}
