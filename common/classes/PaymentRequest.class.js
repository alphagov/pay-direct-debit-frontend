'use strict'

// NPM Dependencies
const lodash = require('lodash')

class PaymentRequest {
  constructor (opts) {
    this.externalId = opts.external_id
    this.amount = opts.amount
    this.type = opts.type
    this.state = opts.state
  }
}

module.exports = PaymentRequest
