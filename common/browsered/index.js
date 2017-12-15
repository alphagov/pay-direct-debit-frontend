'use strict'

// NPM dependencies
const $ = window.$ = window.jQuery = require('jquery') // Put this on window for cross compatability

// Local dependencies
require('../../govuk_modules/govuk_frontend_toolkit/javascripts/govuk/show-hide-content.js')

$(document).ready($ => {
  const showHideContent = new window.GOVUK.ShowHideContent()
  showHideContent.init()
})
