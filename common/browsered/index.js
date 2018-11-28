'use strict'

// Polyfills introduced as a temporary fix to make Smoketests pass. See PP-3489
require('./polyfills')

// NPM dependencies
const analytics = require('gaap-analytics')
const GOVUKFrontend = require('govuk-frontend') // GOV.UK Frontend js bundle

// Local dependencies
const fieldValidation = require('./field-validation')
const inputConfirm = require('./input-confirm')

fieldValidation.enableFieldValidation()
inputConfirm()
analytics.virtualPageview.init()
GOVUKFrontend.initAll()
