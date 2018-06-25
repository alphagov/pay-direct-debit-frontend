'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')
const {validateAndRefreshCsrf} = require('../../common/middleware/csrf/csrf')
const checkSecureCookie = require('../../common/middleware/check-secure-cookie/check-secure-cookie').middleware
const getMandate = require('../../common/middleware/get-mandate/get-mandate').middleware
const getGatewayAccount = require('../../common/middleware/get-gateway-account/get-gateway-account').middleware
const getService = require('../../common/middleware/get-service/get-service').middleware
const mandateStateEnforcerWrapper = require('../../common/middleware/mandate-state-enforcer/mandate-state-enforcer').middleware

// Initialisation
const router = express.Router()
const indexPath = '/confirmation/:mandateExternalId'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, checkSecureCookie, validateAndRefreshCsrf, getMandate, mandateStateEnforcerWrapper('confirmation'), getGatewayAccount, getService, getController)
router.post(paths.index, checkSecureCookie, validateAndRefreshCsrf, getMandate, mandateStateEnforcerWrapper('confirmation'), getGatewayAccount, getService, postController)

// Export
module.exports = {
  router,
  paths
}
