'use strict'

class PaymentRequest {
  constructor (opts) {
    this.externalId = opts.external_id
    this.returnUrl = opts.return_url
    this.gatewayAccountId = opts.gateway_account_id
    this.amount = penceToPounds(opts.amount)
    this.description = opts.description
    this.type = opts.type
    this.state = opts.state
  }
}
let penceToPounds = (pence) => {
  return (parseInt(pence) / 100).toFixed(2)
}
module.exports = PaymentRequest
