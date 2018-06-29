'use strict'

class Transaction {
  constructor (opts) {
    this.externalId = opts.external_id
    this.amount = penceToPounds(opts.amount)
    this.description = opts.description
    this.state = opts.state
    this.reference = opts.reference
  }
}

const penceToPounds = (pence) => {
  return (parseInt(pence) / 100).toFixed(2)
}

module.exports = Transaction
