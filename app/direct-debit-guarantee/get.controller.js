'use strict'

module.exports = (req, res) => {
  const paymentRequestExternalId = req.params.paymentRequestExternalId
  const params = {
    paymentRequestExternalId
  }
  res.render('app/direct-debit-guarantee/get', params)
}
