'use strict'
const {getSessionVariable} = require('../../common/config/cookies')
const {renderErrorView, renderPaymentCompletedSummary} = require('../../common/response')

module.exports = (req, res) => {
  const paymentRequest = res.locals.paymentRequest
  const session = getSessionVariable(req, paymentRequest.externalId)
  if (paymentRequest.state.status === 'pending') {
    renderPaymentCompletedSummary(req, res, {'status': 'successful', 'returnUrl': paymentRequest.returnUrl}
    )
  } else if (session.confirmationDetails) {
    const params = {
      paymentRequestExternalId: paymentRequest.externalId,
      accountHolderName: session.confirmationDetails.accountHolderName,
      accountNumber: session.confirmationDetails.accountNumber,
      sortCode: session.confirmationDetails.sortCode.match(/.{2}/g).join(' '),
      returnUrl: paymentRequest.returnUrl,
      description: paymentRequest.description,
      amount: paymentRequest.amount,
      paymentAction: 'confirmation'
    }
    res.render('app/confirmation/get', params)
  } else {
    renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
  }
}
