'use strict'

// npm dependencies
const express = require('express')

// Local dependencies
const getController = require('./get.controller')

// Initialisation
const router = express.Router()
const indexPath = '/direct-debit-guarantee'
const paymentJourneyPath = '/direct-debit-guarantee/:paymentAction/:paymentRequestExternalId'
const paths = {
  index: indexPath,
  paymentJourney: paymentJourneyPath
}

// Routing
router.get(paths.index, getController)
router.get(paths.paymentJourney, getController)

// Export
module.exports = {
  router,
  paths
}
