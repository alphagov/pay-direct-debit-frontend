'use strict'
const {getSessionVariable} = require('../../common/config/cookies')

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const session = getSessionVariable(req, paymentRequestExternalId)
  const paymentRequest = session.paymentRequest
  const confirmationDetails = session.confirmationDetails
  const params = {
    paymentRequestExternalId,
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
