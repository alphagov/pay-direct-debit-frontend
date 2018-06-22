'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const {validateAndRefreshCsrf} = require('../../common/middleware/csrf/csrf')
const checkSecureCookie = require('../../common/middleware/check-secure-cookie/check-secure-cookie').middleware
const getGatewayAccount = require('../../common/middleware/get-gateway-account/get-gateway-account').middleware
const getService = require('../../common/middleware/get-service/get-service').middleware
const getMandate = require('../../common/middleware/get-mandate/get-mandate').middleware
const mandateStateEnforcerWrapper = require('../../common/middleware/mandate-state-enforcer/mandate-state-enforcer').middlewareWrapper

// Initialisation
const router = express.Router()
const indexPath = '/cancel/:mandateExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, checkSecureCookie, validateAndRefreshCsrf, getMandate, mandateStateEnforcerWrapper('cancel'), getGatewayAccount, getService, getController)

// Export
module.exports = {
  router,
  paths
}
