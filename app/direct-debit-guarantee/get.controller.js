'use strict'

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const paymentAction = req.params.paymentAction
  const params = {
    paymentRequestExternalId,
    paymentAction
  }
  res.render('app/direct-debit-guarantee/get', params)
}
