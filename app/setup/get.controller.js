'use strict'

// NPM dependencies
const _ = require('lodash')

// Local dependencies
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  //todo show different page with different params depending on mandate type
  const mandate = res.locals.mandate
  const session = getSessionVariable(req, mandate.externalId)
  const params = {
    mandateExternalId: mandate.externalId,
    description: mandate.transaction.description,
    amount: mandate.transaction.amount,
    returnUrl: `/change-payment-method/${mandate.externalId}`,
    paymentAction: 'setup',
    service: res.locals.service
  }
  const formValues = session.formValues

  if (_.isEmpty(formValues) && mandate.payer) {
    params.formValues = {
      account_holder_name: mandate.payer.accountHolderName,
      email: mandate.payer.email,
      requires_authorisation: mandate.payer.requiresAuthorisation.toString()
    }
    params.validationErrors = null
  } else if (!_.isEmpty(formValues)) {
    // set values to current view
    params.formValues = formValues
    params.validationErrors = session.validationErrors
    // clear form values from session
    delete session.formValues
    delete session.validationErrors
  }
  res.render('app/setup/get', params)
}
