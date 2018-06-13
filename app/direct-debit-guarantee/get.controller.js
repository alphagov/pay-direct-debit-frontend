'use strict'

module.exports = (req, res) => {
  const mandateExternalId = req.params.mandateExternalId
  const paymentAction = req.params.paymentAction
  const params = {
    mandateExternalId,
    paymentAction
  }
  res.render('app/direct-debit-guarantee/get', params)
}
