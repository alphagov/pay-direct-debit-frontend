'use strict'
const {getSessionVariable} = require('../../common/config/cookies')
const {renderErrorView, renderPaymentCompletedSummary} = require('../../common/response')

module.exports = (req, res) => {
  const mandate = res.locals.mandate
  const session = getSessionVariable(req, mandate.externalId)
  if (mandate.state.status === 'pending') {
    renderPaymentCompletedSummary(req, res, {'status': 'successful', 'returnUrl': mandate.returnUrl}
    )
  } else if (session.confirmationDetails) {
    const params = {
      mandateExternalId: mandate.externalId,
      accountHolderName: session.confirmationDetails.accountHolderName,
      accountNumber: session.confirmationDetails.accountNumber,
      sortCode: session.confirmationDetails.sortCode.match(/.{2}/g).join(' '),
      returnUrl: mandate.returnUrl,
      description: mandate.transaction.description,
      amount: mandate.transaction.amount,
      paymentAction: 'confirmation'
    }
    res.render('app/confirmation/get', params)
  } else {
    renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
  }
}
