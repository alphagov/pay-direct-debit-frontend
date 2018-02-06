'use strict'

module.exports = (req, res) => {
  const confirmationDetails = req.session.confirmationDetails
  const paymentRequest = req.session.paymentRequest
  const params = {
    paymentRequestExternalId: req.params.paymentRequestExternalId,
    accountHolderName: confirmationDetails.accountHolderName,
    accountNumber: confirmationDetails.accountNumber,
    sortCode: confirmationDetails.sortCode.match(/.{2}/g).join(' '),
    returnUrl: paymentRequest.returnUrl,
    description: paymentRequest.description,
    amount: paymentRequest.amount
  }
  res.render('app/confirmation/get', params)
}
