'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const {validateAndRefreshCsrf} = require('../../common/middleware/csrf')
const checkSecureCookie = require('../../common/middleware/check-secure-cookie').middleware
const getPaymentRequest = require('../../common/middleware/get-mandate').middleware
const getGatewayAccount = require('../../common/middleware/get-gateway-account').middleware
const getService = require('../../common/middleware/get-service').middleware

// Initialisation
const router = express.Router()
const indexPath = '/cancel/:mandateExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, checkSecureCookie, validateAndRefreshCsrf, getPaymentRequest, getGatewayAccount, getService, getController)

// Export
module.exports = {
  router,
  paths
}
