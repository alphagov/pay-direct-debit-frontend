'use strict'
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const session = getSessionVariable(req, paymentRequest.externalId)
  const confirmationDetails = session.confirmationDetails

  const params = {
    paymentRequestExternalId: paymentRequest.externalId,
    accountHolderName: confirmationDetails.accountHolderName,
    accountNumber: confirmationDetails.accountNumber,
    sortCode: confirmationDetails.sortCode.match(/.{2}/g).join(' '),
    returnUrl: paymentRequest.returnUrl,
    description: paymentRequest.description,
    amount: paymentRequest.amount,
    paymentAction: 'confirmation'
  }
  res.render('app/confirmation/get', params)
}
