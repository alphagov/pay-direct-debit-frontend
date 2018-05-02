'use strict'

// NPM dependencies
const _ = require('lodash')

// Local dependencies
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const session = getSessionVariable(req, paymentRequestExternalId)
  const paymentRequest = session.paymentRequest
  const params = {
    paymentRequestExternalId: paymentRequestExternalId,
    description: paymentRequest.description,
    amount: paymentRequest.amount,
    returnUrl: `/change-payment-method/${paymentRequestExternalId}`,
    paymentAction: 'setup'
  }
  const formValues = session.formValues
  if (!_.isEmpty(formValues)) {
    // set values to current view
    params.formValues = formValues
    params.validationErrors = session.validationErrors
    // clear form values from session
    delete session.formValues
    delete session.validationErrors
  }
  res.render('app/setup/get', params)
}
