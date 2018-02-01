'use strict'

// NPM dependencies
const lodash = require('lodash')

// Local dependencies
const countries = require('../../common/utils/countries')

module.exports = (req, res) => {
  const retrievedCountries = countries.retrieveCountries()
  const paymentRequest = req.session.paymentRequest || {} // refactor this to a middleware and do not process the request if we don't have req.session.paymentRequest
  const params = {
    countries: retrievedCountries,
    paymentRequestExternalId: req.params.paymentRequestExternalId,
    description: paymentRequest.description,
    amount: paymentRequest.amount
  }
  if (!lodash.isEmpty(req.session.formValues)) {
    // preselect country
    params.countries.forEach((country) => {
      country.entry.selected = country.entry.country === req.session.formValues.country_code
    })
    // set values to current view
    params.formValues = req.session.formValues
    params.validationErrors = req.session.validationErrors
    // clear form values from session
    delete req.session.formValues
    delete req.session.validationErrors
  }
  res.render('app/setup/get', params)
}
