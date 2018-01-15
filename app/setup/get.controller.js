'use strict'

// Local dependencies
const countries = require('../../common/utils/countries')

module.exports = (req, res) => {
  const paymentRequest = req.session.paymentRequest
  const params = {
    countries: countries.retrieveCountries(),
    paymentRequestExternalId: req.params.paymentRequestExternalId,
    description: paymentRequest.description,
    amount: paymentRequest.amount
  }
  res.render('app/setup/get', params)
}
