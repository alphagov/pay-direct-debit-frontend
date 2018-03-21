'use strict'

// NPM dependencies
const $ = window.$ = window.jQuery = require('jquery') // Put this on window for cross compatability
const analytics = require('gaap-analytics')

// GOV.UK Toolkit dependencies
require('../../govuk_modules/govuk_frontend_toolkit/javascripts/govuk/show-hide-content')
require('../../govuk_modules/govuk_frontend_toolkit/javascripts/govuk/stick-at-top-when-scrolling')

// Local dependencies
const fieldValidation = require('./field-validation')
const inputConfirm = require('./input-confirm')

$(document).ready($ => {
  const showHideContent = new window.GOVUK.ShowHideContent()
  showHideContent.init()
  window.GOVUK.stickAtTopWhenScrolling.init()
})

fieldValidation.enableFieldValidation()
inputConfirm()
analytics.virtualPageview.init()
